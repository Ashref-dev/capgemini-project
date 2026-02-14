import { NextRequest, NextResponse } from "next/server"
import {
  getPostById,
  updatePost,
  deletePost,
} from "@/db/utils"
import type { NewPost } from "@/db/schema"

/**
 * GET /api/posts/[id]
 * Fetch post by ID (with author)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid post ID",
        },
        { status: 400 }
      )
    }

    const post = await getPostById(postId)

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch post",
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/posts/[id]
 * Update post by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid post ID",
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Only allow specific fields to be updated
    const updateData: Partial<NewPost> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content

    const updatedPost = await updatePost(postId, updateData)

    if (!updatedPost) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: "Post updated successfully",
    })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update post",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete post by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid post ID",
        },
        { status: 400 }
      )
    }

    // Verify post exists
    const post = await getPostById(postId)
    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 }
      )
    }

    // Delete post
    await deletePost(postId)

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete post",
      },
      { status: 500 }
    )
  }
}
