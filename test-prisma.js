const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.user.findUnique({
      where: { id: 'test' },
      select: { role: true, permissions: true, permissionGroup: { select: { permissions: true } } }
    });
    console.log("Success select");
  } catch(e) {
    console.error("Select error:", e.message);
  }
}
run();
