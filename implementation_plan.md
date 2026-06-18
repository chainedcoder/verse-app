# Chat and Support Ticket Backend Architecture

This plan outlines the technical specifications, backend business logic, and API route architectures for expanding the Verse application to include the Chat and Support Ticket features. The design maps directly to the existing frontend mockups while introducing the required backend logic for advanced membership lifecycles and app-aware AI orchestration.

## User Review Required

> [!WARNING]
> **Database Schema Changes**: The proposed schemas for Tickets, Threads, Messages, ThreadMemberships, and the generic `LogEvent` system will require creating new tables and migrating from old audit logs if any exist. 
> **AI Provider Swapping**: The OpenRouter/Gemini wrapper will be controlled via server-side configuration, meaning it will apply globally. Please confirm if provider swapping should be per-agent or global.
> **Event Archival**: The `LogEvent` system can grow rapidly. As seen in the reference material, we should consider scheduling a cron job (e.g., using BullMQ or a Next.js cron route) to move older events to an `ArchivedLogEvent` table.

## Open Questions

> [!IMPORTANT]
> 1. **Authentication**: Which authentication provider is currently used (e.g., NextAuth, Clerk)? This affects how we validate `userId` and roles in the API layer.
> 2. **Real-time Engine**: For the conversational stream and timeline injections, what real-time technology is preferred? (e.g., WebSockets, Socket.io, Server-Sent Events (SSE), or a managed service like Pusher/Ably).
> 3. **AI Generation Timeout**: For "Inactive State" background generation, what queueing service (e.g., BullMQ, Redis, AWS SQS) is preferred for handling the persistent approval log queue?

## Proposed Changes

### 1. Data Schema Definitions

> [!NOTE]
> Below are relational pseudo-schemas (using Prisma DSL for readability). The `ThreadMembership` handles the hybrid history revocation by explicitly defining time bounds (`historyGrantedFrom`, `historyGrantedTo`). The `LogEvent` schema acts as a generic, system-wide auditing solution with robust sanitization capabilities.

```prisma
model Ticket {
  id           String   @id @default(uuid())
  status       String   // Open, In Progress, Pending, Resolved, Closed
  priority     String   // Low, Medium, High, Urgent
  category     String
  requestType  String
  title        String
  snippet      String
  
  reporterId   String   // Foreign Key to User
  assigneeId   String?  // Foreign Key to Agent/Admin
  
  // Entity Detail (Optional Context)
  entityType   String?
  entityId     String?
  entityName   String?
  
  // Relations
  thread       Thread   @relation(fields: [threadId], references: [id])
  threadId     String   @unique
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Thread {
  id           String   @id @default(uuid())
  type         String   // Ticket, LiveChat
  pinned       Boolean  @default(false)
  
  // Relations
  ticket       Ticket?
  messages     Message[]
  memberships  ThreadMembership[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Message {
  id           String   @id @default(uuid())
  threadId     String
  senderId     String   // 'system', or User/Agent ID
  senderType   String   // user, agent, system
  content      String   // Can store JSON array of bubbles
  parentId     String?  // For threaded target replies
  
  createdAt    DateTime @default(now())
  
  thread       Thread   @relation(fields: [threadId], references: [id])
}

model ThreadMembership {
  id                 String   @id @default(uuid())
  threadId           String
  userId             String
  role               String   // viewer, participant, admin
  
  // Permanent Access Window bounds
  joinedAt           DateTime @default(now())
  leftAt             DateTime? // Null means still active
  
  // Hybrid Revocation Rule bounds (Optional Custom Window)
  // Users can be granted an arbitrary window of historical context
  historyGrantedFrom DateTime? 
  historyGrantedTo   DateTime?
  
  thread             Thread   @relation(fields: [threadId], references: [id])
}

// Highly robust system-wide event logging (inspired by NestJS/TypeORM enterprise examples)
model LogEvent {
  id           String   @id @default(uuid())
  timestamp    DateTime @default(now())
  
  entityName   String   // The entity being modified (e.g., 'Ticket', 'User')
  operation    String   // e.g., INSERT, UPDATE, DELETE, STATUS_CHANGE
  
  changes      Json?    // { before: {...}, after: {...} } 
  // PII fields should be sanitized/redacted before saving here
  
  severity     String   @default("MEDIUM") // LOW, MEDIUM, HIGH, CRITICAL
  accessLevel  String   @default("USER")   // USER, ADMIN, SYSTEM
  
  tags         String[] // String array for advanced filtering
  
  actorId      String?  // ID of the User, Admin, or 'System' performing the action
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// Approval Queue for AI
model AIGenerationQueue {
  id           String   @id @default(uuid())
  threadId     String
  agentId      String
  draftContent String
  status       String   // Pending, Approved, Discarded, Edited
  
  createdAt    DateTime @default(now())
}
```

### 2. API Endpoint Blueprint

#### User-Facing API
- `POST /api/user/tickets` - Raise a new ticket.
- `GET /api/user/tickets` - List user's tickets (Filter by status, sort by date).
- `GET /api/user/tickets/:id` - View ticket details and thread.
- `PATCH /api/user/tickets/:id/status` - Mark ticket as Resolved or Closed (Users are restricted to terminal states).
- `POST /api/user/chat` - Initiate a new Live Chat thread.
- `POST /api/user/chat/:threadId/messages` - Send a message (or reply to `parentId`).
- `PATCH /api/user/preferences` - Update user chat preferences.

#### Admin-Facing API
- `GET /api/admin/tickets` - Global view (Tabs: All/Open/Closed, Filters: Category, Sort: Date).
- `PATCH /api/admin/tickets/:id` - Update ticket (Admin/Support can edit Status to *any* depth: Open, In Progress, Pending, Resolved, Closed. Also editable: Assignee, Priority, Category).
  - *Trigger:* Auto-injects a `LogEvent` system message in the thread.
- `POST /api/admin/threads/:threadId/members` - Add agent to thread.
  - *Payload:* `{ agentId, historyGrantedFrom, historyGrantedTo }`.
- `DELETE /api/admin/threads/:threadId/members/:agentId` - Remove agent.
  - *Trigger:* Sets `leftAt = now()`.
- `PATCH /api/admin/threads/:threadId/members/:agentId/revoke-history` - Revoke custom history.
  - *Trigger:* Updates `historyGrantedFrom = null` and `historyGrantedTo = null`.

#### Auditing & Logs API (Admin Only)
- `GET /api/admin/logs` - Filter logs by `entityName`, `operation`, `severity`, `actorId`, or `dateRange`.
- `POST /api/admin/logs/archive` - Trigger bulk manual archive of events older than 6 months (ideally run by a cron task).

### 3. State Machine & Viewport Flow (AI Orchestration)

To support the App-Aware AI Orchestration, the client-side must emit its viewport state to the server via WebSockets or polling.

**Viewport State Tracking:**
- **Active:** Client sends `presence: { threadId: '123', status: 'focused' }`.
- **Passive:** Client sends `presence: { status: 'online_elsewhere' }`.
- **Inactive:** Client WebSocket disconnects.

**AI Routing Logic (When AI generates a response):**
1. **Check Presence:** Backend queries the active socket connections for the assigned `agentId`.
2. **Route: Inline Draft (Active):**
   - Condition: Agent is connected and focused on `threadId`.
   - Action: Push WebSocket event `ai_draft_ready` with the payload. Frontend renders it directly into the message editor.
3. **Route: Workspace Toast (Passive):**
   - Condition: Agent is connected but NOT focused on `threadId` (or focused on a different thread).
   - Action: Push WebSocket event `ai_toast_ready`. Frontend renders a global toast with "Approve / Edit / Discard".
4. **Route: System Dashboard Queue (Inactive):**
   - Condition: Agent is disconnected.
   - Action: Save to `AIGenerationQueue` DB table. When the Agent logs in next, they see pending approvals in their dashboard.

### 4. Modular AI Provider Factory

A factory pattern to allow hot-swapping providers securely. The active provider is determined by an admin setting or `.env` variable.

```typescript
// interfaces/AIProvider.ts
export interface AIProvider {
  generateReply(context: ThreadContext): Promise<string>;
  analyzeIntent(message: string): Promise<TicketMetadata>;
}

// providers/GeminiProvider.ts
export class GeminiProvider implements AIProvider {
  async generateReply(context: ThreadContext) {
    // Uses Google Generative AI SDK mapping
  }
}

// providers/OpenRouterProvider.ts
export class OpenRouterProvider implements AIProvider {
  async generateReply(context: ThreadContext) {
    // Uses OpenAI compatible SDK with OpenRouter base URL & free models
  }
}

// factory/AIFactory.ts
export class AIFactory {
  static getProvider(): AIProvider {
    const providerConfig = process.env.ACTIVE_AI_PROVIDER || 'gemini';
    
    switch (providerConfig) {
      case 'openrouter':
        return new OpenRouterProvider();
      case 'gemini':
      default:
        return new GeminiProvider();
    }
  }
}
```

## Verification Plan

- **Automated Tests:**
  - Jest unit tests for `LogEvent` creation ensuring sensitive fields in the `changes` JSON object are redacted/sanitized.
  - Jest unit tests for the Hybrid Revocation logic: ensuring messages fall within `joinedAt <-> leftAt` OR `historyGrantedFrom <-> historyGrantedTo`.
- **Manual Verification:**
  - Trigger a ticket status change and verify that the `LogEvent` correctly captures the 'before' and 'after' JSON payloads.
  - Ask user to verify the Active/Passive/Inactive viewport flow by opening the app in different tabs/windows and triggering an AI response.
