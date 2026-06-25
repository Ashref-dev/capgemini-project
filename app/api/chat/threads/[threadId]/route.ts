import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { getSessionUser } from "@/lib/server/auth/session"
import { db } from "@/lib/server/db/config"
import { chatMessages, chatThreads } from "@/lib/server/db/schema"

function normalizeTitle(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  return trimmed.slice(0, 120)
}

export async function GET(
  req: NextRequest,
  context: RouteContext<"/api/chat/threads/[threadId]">
) {
  const { threadId } = await context.params
  const user = await getSessionUser(req)

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const userId = Number(user.sub)
  const threadIdNumber = Number(threadId)

  if (!Number.isFinite(userId) || !Number.isInteger(threadIdNumber) || threadIdNumber <= 0) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }

  try {
    const thread = await db
      .select({
        id: chatThreads.id,
        title: chatThreads.title,
        createdAt: chatThreads.createdAt,
        updatedAt: chatThreads.updatedAt,
      })
      .from(chatThreads)
      .where(
        and(
          eq(chatThreads.id, threadIdNumber),
          eq(chatThreads.userId, userId),
          eq(chatThreads.userType, user.userType)
        )
      )
      .limit(1)

    if (thread.length === 0) {
      return NextResponse.json({ error: "Thread introuvable" }, { status: 404 })
    }

    const messages = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        parts: chatMessages.parts,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.threadId, threadIdNumber))
      .orderBy(chatMessages.id)

    return NextResponse.json({ thread: thread[0], messages })
  } catch (error) {
    console.error("Error loading chat thread:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext<"/api/chat/threads/[threadId]">
) {
  const { threadId } = await context.params
  const user = await getSessionUser(req)

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const userId = Number(user.sub)
  const threadIdNumber = Number(threadId)

  if (!Number.isFinite(userId) || !Number.isInteger(threadIdNumber) || threadIdNumber <= 0) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { title?: unknown }
    const title = normalizeTitle(body.title)

    if (title === null) {
      return NextResponse.json({ error: "Titre invalide" }, { status: 400 })
    }

    const updated = await db
      .update(chatThreads)
      .set({ title })
      .where(
        and(
          eq(chatThreads.id, threadIdNumber),
          eq(chatThreads.userId, userId),
          eq(chatThreads.userType, user.userType)
        )
      )
      .returning({
        id: chatThreads.id,
        title: chatThreads.title,
        createdAt: chatThreads.createdAt,
        updatedAt: chatThreads.updatedAt,
      })

    if (updated.length === 0) {
      return NextResponse.json({ error: "Thread introuvable" }, { status: 404 })
    }

    return NextResponse.json({ thread: updated[0] })
  } catch (error) {
    console.error("Error renaming chat thread:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
