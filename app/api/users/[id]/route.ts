import { NextRequest, NextResponse } from "next/server"
import {
  getUserById,
  getUserWithPosts,
  updateUser,
  deleteUser,
} from "@/db/utils"
import type { NewUser } from "@/db/schema"

/**
 * GET /api/users/[id]
 * Fetch user by ID (with optional posts)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 }
      )
    }

    // Check for ?posts=true query parameter
    const { searchParams } = new URL(request.url)
    const includePosts = searchParams.get("posts") === "true"

    const user = includePosts
      ? await getUserWithPosts(userId)
      : await getUserById(userId)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[id]
 * Update user by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Only allow specific fields to be updated
    const updateData: Partial<NewUser> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.image !== undefined) updateData.image = body.image
    if (body.emailVerified !== undefined)
      updateData.emailVerified = body.emailVerified

    const updatedUser = await updateUser(userId, updateData)

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      )
    }

    // Delete user (cascades to posts)
    await deleteUser(userId)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 }
    )
  }
}
