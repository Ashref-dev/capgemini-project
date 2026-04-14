import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { partnerNotifications } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq, desc, and } from "drizzle-orm"

// GET /api/notifications?partnerId=X — List notifications for a partner
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  let partnerId: string | null = searchParams.get("partnerId")

  // Partners automatically get their own
  if (user.userType === "partner") {
    partnerId = user.sub
  }

  if (!partnerId) {
    return NextResponse.json({ error: "partnerId requis" }, { status: 400 })
  }

  try {
    const notifications = await db
      .select()
      .from(partnerNotifications)
      .where(eq(partnerNotifications.partnerId, Number(partnerId)))
      .orderBy(desc(partnerNotifications.createdAt))

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/notifications — Create a notification (employees only)
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { partnerId, type, title, message, emailSubject } = body

    if (!partnerId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Champs requis : partnerId, type, title, message" },
        { status: 400 }
      )
    }

    // Try to send email
    let emailSent = false
    if (emailSubject) {
      try {
        const { sendEmail } = await import("@/backend/services/email")
        emailSent = await sendEmail({
          subject: emailSubject,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0070AD; color: white; padding: 20px; text-align: center;">
              <h2>IntelliConnect - Capgemini Tunisie</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #eee;">
              <h3>${title}</h3>
              <p>${message}</p>
            </div>
            <div style="background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
              Capgemini Tunisie - IntelliConnect Platform
            </div>
          </div>`,
        })
      } catch {
        emailSent = false
      }
    }

    const [notification] = await db
      .insert(partnerNotifications)
      .values({
        partnerId: Number(partnerId),
        type,
        title,
        message,
        emailSent,
        emailSubject: emailSubject || null,
        sentBy: user.name || user.email,
        sentById: Number(user.sub),
      })
      .returning()

    return NextResponse.json({ notification, emailSent }, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH /api/notifications?id=X — Mark as read
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const notifId = searchParams.get("id")

  if (!notifId) {
    return NextResponse.json({ error: "id requis" }, { status: 400 })
  }

  try {
    const [updated] = await db
      .update(partnerNotifications)
      .set({ isRead: true })
      .where(eq(partnerNotifications.id, Number(notifId)))
      .returning()

    return NextResponse.json({ notification: updated })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
