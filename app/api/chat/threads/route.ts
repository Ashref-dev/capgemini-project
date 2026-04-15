import { and, desc, eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { getSessionUser } from "@/backend/auth/session"
import { db } from "@/backend/db/config"
import { chatThreads } from "@/backend/db/schema"

function getThreadTitle(title: unknown) {
  if (typeof title !== "string") {
    return "Nouvelle conversation"
  }

  const trimmedTitle = title.trim()
  return trimmedTitle.length > 0 ? trimmedTitle.slice(0, 120) : "Nouvelle conversation"
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const userId = Number(user.sub)
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Identifiant utilisateur invalide" }, { status: 400 })
  }

  try {
    const threads = await db
      .select({
        id: chatThreads.id,
        title: chatThreads.title,
        createdAt: chatThreads.createdAt,
        updatedAt: chatThreads.updatedAt,
        messageCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM chat_messages
          WHERE thread_id = ${chatThreads.id}
        )`,
      })
      .from(chatThreads)
      .where(and(eq(chatThreads.userId, userId), eq(chatThreads.userType, user.userType)))
      .orderBy(desc(chatThreads.updatedAt))
      .limit(50)

    return NextResponse.json({ threads })
  } catch (error) {
    console.error("Error listing chat threads:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const userId = Number(user.sub)
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Identifiant utilisateur invalide" }, { status: 400 })
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { title?: unknown }
    const now = new Date()

    const insertedThreads = await db
      .insert(chatThreads)
      .values({
        userId,
        userType: user.userType,
        title: getThreadTitle(body.title),
        updatedAt: now,
      })
      .returning({
        id: chatThreads.id,
        title: chatThreads.title,
        createdAt: chatThreads.createdAt,
        updatedAt: chatThreads.updatedAt,
      })

    return NextResponse.json({ thread: insertedThreads[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating chat thread:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const userId = Number(user.sub)
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Identifiant utilisateur invalide" }, { status: 400 })
  }

  try {
    const body = (await req.json()) as { threadId?: unknown }
    const threadId = typeof body.threadId === "number" ? body.threadId : Number(body.threadId)

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json({ error: "Thread invalide" }, { status: 400 })
    }

    const thread = await db
      .select({ id: chatThreads.id })
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.id, threadId),
          eq(chatThreads.userId, userId),
          eq(chatThreads.userType, user.userType)
        )
      )
      .limit(1)

    if (thread.length === 0) {
      return NextResponse.json({ error: "Thread introuvable" }, { status: 404 })
    }

    await db.delete(chatThreads).where(eq(chatThreads.id, threadId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chat thread:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
