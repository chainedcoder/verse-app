export interface ThreadContext {
  threadId: string;
  messages: Array<{ sender: string; content: string }>;
  ticketMetadata?: any;
}

export interface TicketMetadata {
  category: string;
  priority: string;
  intent: string;
}

export interface AIProvider {
  generateReply(context: ThreadContext): Promise<string>;
  analyzeIntent(message: string): Promise<TicketMetadata>;
}
