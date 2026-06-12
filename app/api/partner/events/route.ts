import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partnerEvents } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { eq } from "drizzle-orm"

// GET /api/partner/events — list events for this partner
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const events = await db.query.partnerEvents.findMany({
      where: eq(partnerEvents.partnerId, partnerId),
      orderBy: (e, { desc }) => [desc(e.eventDate)],
    })
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching partner events:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/partner/events — partner submits a new event
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const body = await request.json()

    const newEvent = await db
      .insert(partnerEvents)
      .values({
        partnerId,
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
      })
      .returning()

    return NextResponse.json({ event: newEvent[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating partner event:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
