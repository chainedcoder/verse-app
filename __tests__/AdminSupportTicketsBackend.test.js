import { GET, POST } from '../app/api/admin/tickets/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data)
    }))
  }
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    ticket: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'ticket1' })
    },
    thread: {
      create: jest.fn().mockResolvedValue({ id: 'thread1' })
    },
    logEvent: {
      create: jest.fn().mockResolvedValue({})
    }
  }
}));

jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

describe('Admin Support Tickets API', () => {
  let mockRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      url: 'http://localhost/api/admin/tickets',
      json: jest.fn()
    };
  });

  it('should return 401 if user is not authenticated', async () => {
    auth.mockResolvedValue(null);
    const response = await GET(mockRequest);
    expect(response.status).toBe(401);
  });

  it('should return 403 if user lacks access and lacks manageSupport permission', async () => {
    auth.mockResolvedValue({ user: { id: 'user1' } });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user1',
      role: 'GUEST',
      permissionGroup: {
        permissions: { manageSupport: false }
      }
    });

    const response = await GET(mockRequest);
    expect(response.status).toBe(403);
  });

  it('should return 200 if user is USER but has manageSupport permission via permissionGroup', async () => {
    auth.mockResolvedValue({ user: { id: 'user2' } });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user2',
      role: 'USER',
      permissionGroup: {
        permissions: { manageSupport: true }
      }
    });

    const response = await GET(mockRequest);
    expect(response.status).toBe(200);
  });

  it('should return 200 if user is ADMIN regardless of permissionGroup', async () => {
    auth.mockResolvedValue({ user: { id: 'admin1' } });
    prisma.user.findUnique.mockResolvedValue({
      id: 'admin1',
      role: 'ADMIN',
      permissionGroup: null
    });

    const response = await GET(mockRequest);
    expect(response.status).toBe(200);
  });

  describe('POST /api/admin/tickets', () => {
    let mockPostRequest;

    beforeEach(() => {
      mockPostRequest = {
        url: 'http://localhost/api/admin/tickets',
        json: jest.fn().mockResolvedValue({ targetUserId: 'target1', title: 'Test Ticket' })
      };
    });

    it('should return 403 for POST if user lacks access and lacks manageSupport permission', async () => {
      auth.mockResolvedValue({ user: { id: 'user1' } });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        role: 'GUEST',
        permissionGroup: {
          permissions: { manageSupport: false }
        }
      });

      const response = await POST(mockPostRequest);
      expect(response.status).toBe(403);
    });

    it('should return 201 for POST if user has manageSupport permission', async () => {
      auth.mockResolvedValue({ user: { id: 'user2' } });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user2',
        role: 'USER',
        permissionGroup: {
          permissions: { manageSupport: true }
        }
      });

      const response = await POST(mockPostRequest);
      expect(response.status).toBe(201);
    });
  });
});
