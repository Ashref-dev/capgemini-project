import { NextRequest, NextResponse } from "next/server"
import {
  getAllPosts,
  createPost,
  getPostsByAuthorId,
} from "@/db/utils"
import type { NewPost } from "@/db/schema"

/**
 * GET /api/posts
 * Fetch all posts (latest first)
 */
export async function GET(request: NextRequest) {
  try {
    // Check for ?authorId=X query parameter
    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get("authorId")

    let posts
    if (authorId) {
      posts = await getPostsByAuthorId(parseInt(authorId), 10)
    } else {
      posts = await getAllPosts(10)
    }

    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.authorId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, content, authorId",
        },
        { status: 400 }
      )
    }

    const newPost: NewPost = {
      title: body.title,
      content: body.content,
      authorId: body.authorId,
    }

    const post = await createPost(newPost)

    return NextResponse.json(
      {
        success: true,
        data: post,
        message: "Post created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating post:", error)

    // Handle foreign key violation
    if (error instanceof Error && error.message.includes("foreign key")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid author ID",
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create post",
      },
      { status: 500 }
    )
  }
}
