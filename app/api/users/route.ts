import { NextRequest, NextResponse } from "next/server"
import {
  getAllUsers,
  createUser,
  getUserById,
} from "@/db/utils"
import type { NewUser } from "@/db/schema"

/**
 * GET /api/users
 * Fetch all users
 */
export async function GET() {
  try {
    const users = await getAllUsers(10)
    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email, name",
        },
        { status: 400 }
      )
    }

    const newUser: NewUser = {
      email: body.email,
      name: body.name,
      image: body.image || null,
      emailVerified: body.emailVerified || false,
    }

    const user = await createUser(newUser)

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "User created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500 }
    )
  }
}
