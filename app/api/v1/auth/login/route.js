import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        username: true,
        image: true,
        status: true,
      },
    })

    if (!user || !user.password) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (user.status !== "ACTIVE") {
      return Response.json(
        { error: "Account is suspended or banned" },
        { status: 403 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    return Response.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
