import { prisma } from "../lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, role: true }});
  console.log("All users:", users);
  await prisma.$disconnect();
}
main();
