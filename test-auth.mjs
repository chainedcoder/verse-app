import { prisma } from './lib/prisma.js'

async function main() {
  const sessionToken = crypto.randomUUID()
  console.log("UUID:", sessionToken)
  await prisma.session.create({
    data: {
      sessionToken,
      userId: 'test-user-id', // Assuming there's a user or it will fail foreign key constraint!
      expires: new Date(Date.now() + 1000000)
    }
  }).catch(e => console.log("Prisma Error:", e.message))
}
main()
