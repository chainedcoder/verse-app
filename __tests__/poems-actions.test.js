import { createAnonShare, claimAnonShare } from '../app/actions/poems'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

jest.mock('@/auth', () => ({
  auth: jest.fn()
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn()
    },
    poem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}))

jest.mock('@/lib/s3', () => ({
  uploadFileToS3: jest.fn()
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

describe('Poems Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createAnonShare', () => {
    it('uses session user id if logged in', async () => {
      auth.mockResolvedValueOnce({ user: { id: 'user123' } })
      prisma.poem.create.mockResolvedValueOnce({ id: 'p1' })

      const res = await createAnonShare({ title: 'T', fullText: 'B', customAuthorName: 'A' })
      
      expect(res.poemId).toBe('p1')
      expect(prisma.poem.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          authorId: 'user123',
          status: 'ANON_SHARE'
        })
      }))
    })

    it('creates or uses guest user if not logged in', async () => {
      auth.mockResolvedValueOnce(null)
      prisma.user.findFirst.mockResolvedValueOnce(null)
      prisma.user.create.mockResolvedValueOnce({ id: 'guest999' })
      prisma.poem.create.mockResolvedValueOnce({ id: 'p2' })

      await createAnonShare({ title: 'T', fullText: 'B' })

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ username: 'guest' })
      })
      expect(prisma.poem.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          authorId: 'guest999'
        })
      }))
    })
  })

  describe('claimAnonShare', () => {
    it('fails if unauthorized', async () => {
      auth.mockResolvedValueOnce(null)
      const res = await claimAnonShare('p1')
      expect(res.error).toBe('Unauthorized')
    })

    it('fails if poem not owned by user', async () => {
      auth.mockResolvedValueOnce({ user: { id: 'user1' } })
      prisma.poem.findUnique.mockResolvedValueOnce({ authorId: 'user2' })
      
      const res = await claimAnonShare('p1')
      expect(res.error).toBe('Unauthorized')
    })

    it('fails if poem is not ANON_SHARE', async () => {
      auth.mockResolvedValueOnce({ user: { id: 'user1' } })
      prisma.poem.findUnique.mockResolvedValueOnce({ authorId: 'user1', status: 'DRAFT' })
      
      const res = await claimAnonShare('p1')
      expect(res.error).toBe('Poem is not an anonymous share.')
    })

    it('updates status to PUBLISHED', async () => {
      auth.mockResolvedValueOnce({ user: { id: 'user1' } })
      prisma.poem.findUnique.mockResolvedValueOnce({ authorId: 'user1', status: 'ANON_SHARE' })
      prisma.poem.update.mockResolvedValueOnce({ id: 'p1' })
      
      const res = await claimAnonShare('p1')
      expect(res.success).toBe(true)
      expect(prisma.poem.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { status: 'PUBLISHED' }
      })
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })
  })
})
