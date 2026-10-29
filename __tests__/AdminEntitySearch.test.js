import { GET } from '../app/api/admin/entities/search/route';
import { GET as searchUsers } from '../app/api/admin/users/search/route';
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
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    poem: { findMany: jest.fn() },
    comment: { findMany: jest.fn() },
    collection: { findMany: jest.fn() }
  }
}));

jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

// MySQL has no `mode: "insensitive"` (its collation is already case-insensitive)
// and Prisma rejects the option, so no search filter may carry it.
const hasModeOption = (value) =>
  value !== null && typeof value === 'object' &&
  ('mode' in value || Object.values(value).some(hasModeOption));

const search = (model, q) => GET({ url: `http://localhost/api/admin/entities/search?model=${model}&q=${q}` });

describe('Admin entity search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ user: { id: 'admin1' } });
    prisma.user.findUnique.mockResolvedValue({ id: 'admin1', role: 'ADMIN' });
  });

  it.each([
    ['User', prisma.user],
    ['Poem', prisma.poem],
    ['Comment', prisma.comment],
    ['Collection', prisma.collection],
  ])('searches %s without the Postgres-only mode option', async (model, delegate) => {
    delegate.findMany.mockResolvedValue([]);

    const res = await search(model, 'Wild');

    expect(res.status).toBe(200);
    const args = delegate.findMany.mock.calls[0][0];
    expect(JSON.stringify(args.where)).toContain('Wild');
    expect(hasModeOption(args.where)).toBe(false);
  });

  it('labels collections with their author', async () => {
    prisma.collection.findMany.mockResolvedValue([
      { id: 'c1', name: 'Autumn', author: { name: 'Emily' } }
    ]);

    const res = await search('Collection', 'Aut');
    const body = await res.json();

    expect(prisma.collection.findMany.mock.calls[0][0].select).toEqual({
      id: true, name: true, author: { select: { name: true } }
    });
    expect(body.entities).toEqual([{ id: 'c1', name: 'Autumn', detail: 'By Emily' }]);
  });
});

describe('Admin user search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } });
    prisma.user.findUnique.mockResolvedValue({ id: 'admin1', role: 'ADMIN' });
    prisma.user.findMany.mockResolvedValue([]);
  });

  it('filters by name and email without the mode option', async () => {
    await searchUsers({ url: 'http://localhost/api/admin/users/search?q=reload' });

    const args = prisma.user.findMany.mock.calls[0][0];
    expect(args.where.OR).toEqual([
      { name: { contains: 'reload' } },
      { email: { contains: 'reload' } }
    ]);
  });
});
