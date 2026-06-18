import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env') })
import { prisma } from './lib/prisma.js'

async function testDelete() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'delete' } }
    });
    
    if (!user) {
      console.log('No user found');
      return;
    }
    console.log('Found user:', user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date()
      }
    });
    console.log('Update successful');
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDelete();
