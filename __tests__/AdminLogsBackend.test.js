import { GET } from '../app/api/admin/logs/route';
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
    logEvent: {
      findMany: jest.fn().mockResolvedValue([])
    }
  }
}));

jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

describe('Admin Logs API', () => {
  let mockRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      url: 'http://localhost/api/admin/logs',
      json: jest.fn()
    };
  });

  it('should return 403 if user lacks manageSystem permission', async () => {
    auth.mockResolvedValue({ user: { id: 'user1' } });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user1',
      role: 'USER',
      permissionGroup: {
        permissions: { manageSystem: false, manageSupport: true }
      }
    });

    const response = await GET(mockRequest);
    expect(response.status).toBe(403);
  });

  it('should return 200 if user has manageSystem permission', async () => {
    auth.mockResolvedValue({ user: { id: 'user2' } });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user2',
      role: 'USER',
      permissionGroup: {
        permissions: { manageSystem: true }
      }
    });

    const response = await GET(mockRequest);
    expect(response.status).toBe(200);
  });
});
