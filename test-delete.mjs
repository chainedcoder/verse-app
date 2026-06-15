import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function run() {
  const user = await prisma.user.create({
    data: {
      name: 'Test Delete',
      email: 'testdelete@example.com',
      username: 'testdelete',
      password: 'foo'
    }
  })
  console.log("Created user", user.id)
  
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          status: "DELETED",
          name: "[deleted]",
          username: `deleted-${user.id}`,
          email: `deleted-${user.id}@deleted.local`,
          bio: null,
          website: null,
          location: null,
          image: null,
          password: null,
          twoFactorSecret: null,
        }
      }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.authenticator.deleteMany({ where: { userId: user.id } }),
      prisma.poem.deleteMany({ where: { authorId: user.id } }),
      prisma.like.deleteMany({ where: { userId: user.id } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: user.id }, { followingId: user.id }] } }),
      prisma.collection.deleteMany({ where: { authorId: user.id } }),
      prisma.notification.deleteMany({ where: { OR: [{ userId: user.id }, { actorId: user.id }] } })
    ])
    console.log("SUCCESS")
  } catch(e) {
    console.error("ERROR", e.message)
  }
}
run()
