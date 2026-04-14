import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { partnerEvents } from "@/backend/db/schema"
import { getSessionUser, isAdminOrManager } from "@/backend/auth/session"
import { eq } from "drizzle-orm"

// GET /api/events
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const events = await db.query.partnerEvents.findMany({
      with: { partner: { columns: { id: true, name: true } } },
      orderBy: (e, { desc }) => [desc(e.eventDate)],
    })
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/events (admin/manager)
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const newEvent = await db
      .insert(partnerEvents)
      .values({
        partnerId: Number(body.partnerId),
        eventName: body.eventName,
        eventType: body.eventType || null,
        eventDate: body.eventDate,
        eventLocation: body.eventLocation || null,
        numParticipants: body.numParticipants ? Number(body.numParticipants) : null,
        numCapgeminiAttendees: body.numCapgeminiAttendees ? Number(body.numCapgeminiAttendees) : null,
        numLeadsGenerated: body.numLeadsGenerated ? Number(body.numLeadsGenerated) : null,
        numConversions: body.numConversions ? Number(body.numConversions) : null,
        eventBudget: body.eventBudget ? Number(body.eventBudget) : null,
        satisfactionScore: body.satisfactionScore ? Number(body.satisfactionScore) : null,
        eventStatus: body.eventStatus || "planifie",
        notes: body.notes || null,
        eventRevenue: body.eventRevenue ? Number(body.eventRevenue) : null,
      })
      .returning()

    return NextResponse.json({ event: newEvent[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}

// DELETE /api/events (admin/manager)
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    await db.delete(partnerEvents).where(eq(partnerEvents.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
