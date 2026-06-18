import { routeAIGeneration, updatePresence } from '../lib/ai/orchestrator';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    aIGenerationQueue: {
      create: jest.fn().mockResolvedValue({ id: '1' })
    }
  }
}));

describe('AI Orchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes to inline_draft if agent is focused on the thread', async () => {
    updatePresence('agent1', { agentId: 'agent1', status: 'focused', threadId: 'thread1' });
    const result = await routeAIGeneration('thread1', 'agent1', 'Draft content');
    expect(result.route).toBe('inline_draft');
  });

  it('routes to workspace_toast if agent is focused on a different thread', async () => {
    updatePresence('agent2', { agentId: 'agent2', status: 'focused', threadId: 'other_thread' });
    const result = await routeAIGeneration('thread1', 'agent2', 'Draft content');
    expect(result.route).toBe('workspace_toast');
  });

  it('routes to workspace_toast if agent is online elsewhere', async () => {
    updatePresence('agent3', { agentId: 'agent3', status: 'online_elsewhere' });
    const result = await routeAIGeneration('thread1', 'agent3', 'Draft content');
    expect(result.route).toBe('workspace_toast');
  });

  it('routes to dashboard_queue if agent is offline', async () => {
    updatePresence('agent4', { agentId: 'agent4', status: 'offline' });
    const result = await routeAIGeneration('thread1', 'agent4', 'Draft content');
    expect(result.route).toBe('dashboard_queue');
    
    // Check if prisma was called
    const { prisma } = require('@/lib/prisma');
    expect(prisma.aIGenerationQueue.create).toHaveBeenCalledWith({
      data: {
        threadId: 'thread1',
        agentId: 'agent4',
        draftContent: 'Draft content',
        status: 'Pending'
      }
    });
  });
});
