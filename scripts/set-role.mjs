import { prisma } from "../lib/prisma.js"

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error("Usage: node set-role.mjs <user_email> <role>")
    console.error("Available roles: USER, MODERATOR, ADMIN")
    process.exit(1)
  }

  const [email, roleInput] = args
  const role = roleInput.toUpperCase()

  if (!["USER", "MODERATOR", "ADMIN"].includes(role)) {
    console.error(`Invalid role: ${role}. Must be one of USER, MODERATOR, ADMIN.`)
    process.exit(1)
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    })

    console.log(`✅ Successfully updated role for ${user.email} to ${user.role}.`)
  } catch (error) {
    if (error.code === "P2025") {
      console.error(`❌ User with email ${email} not found.`)
    } else {
      console.error("❌ An error occurred:", error.message)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
