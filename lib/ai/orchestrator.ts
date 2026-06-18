import { prisma } from "@/lib/prisma";

export interface ViewportPresence {
  agentId: string;
  status: 'focused' | 'online_elsewhere' | 'offline';
  threadId?: string;
}

// In-memory store for demonstration. In production, use Redis.
const presenceStore = new Map<string, ViewportPresence>();

export function updatePresence(agentId: string, presence: ViewportPresence) {
  presenceStore.set(agentId, presence);
}

export async function routeAIGeneration(threadId: string, agentId: string, draftContent: string) {
  const presence = presenceStore.get(agentId) || { agentId, status: 'offline' };

  if (presence.status === 'focused' && presence.threadId === threadId) {
    // 2. Route: Inline Draft (Active)
    console.log(`[AI Routing] Sending ai_draft_ready via WebSocket to Agent ${agentId} for Thread ${threadId}`);
    return { route: 'inline_draft' };
  } else if (presence.status === 'online_elsewhere' || (presence.status === 'focused' && presence.threadId !== threadId)) {
    // 3. Route: Workspace Toast (Passive)
    console.log(`[AI Routing] Sending ai_toast_ready via WebSocket to Agent ${agentId} for Thread ${threadId}`);
    return { route: 'workspace_toast' };
  } else {
    // 4. Route: System Dashboard Queue (Inactive)
    console.log(`[AI Routing] Saving to AIGenerationQueue for Agent ${agentId} for Thread ${threadId}`);
    
    await prisma.aIGenerationQueue.create({
      data: {
        threadId,
        agentId,
        draftContent,
        status: "Pending"
      }
    });

    return { route: 'dashboard_queue' };
  }
}
