import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partnerMeetings, partners } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { eq, desc } from "drizzle-orm"

// GET /api/meetings?partnerId=X — List meetings for a partner
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const partnerId = searchParams.get("partnerId")

  if (!partnerId) {
    return NextResponse.json({ error: "partnerId requis" }, { status: 400 })
  }

  // Partners can only see their own meetings
  if (user.userType === "partner" && Number(user.sub) !== Number(partnerId)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  try {
    const meetings = await db
      .select()
      .from(partnerMeetings)
      .where(eq(partnerMeetings.partnerId, Number(partnerId)))
      .orderBy(desc(partnerMeetings.meetingDate))

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/meetings — Create a meeting for a partner (employees only)
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      partnerId, title, meetingDate, durationMinutes, location, meetingType,
      agenda, conclusions, remarks, agreements, sharedDocuments, satisfactionScore, nextSteps,
    } = body

    if (!partnerId || !title || !meetingDate || !durationMinutes || !meetingType) {
      return NextResponse.json(
        { error: "Champs requis : partnerId, title, meetingDate, durationMinutes, meetingType" },
        { status: 400 }
      )
    }

    // Validate partner exists
    const [partner] = await db
      .select({ id: partners.id })
      .from(partners)
      .where(eq(partners.id, Number(partnerId)))

    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 })
    }

    const [meeting] = await db
      .insert(partnerMeetings)
      .values({
        partnerId: Number(partnerId),
        title,
        meetingDate: new Date(meetingDate),
        durationMinutes: Number(durationMinutes),
        employeeName: user.name || user.email,
        employeeRole: user.role || null,
        employeeId: Number(user.sub),
        location: location || null,
        meetingType,
        agenda: agenda || null,
        conclusions: conclusions || null,
        remarks: remarks || null,
        agreements: agreements || null,
        sharedDocuments: sharedDocuments || null,
        satisfactionScore: satisfactionScore ? Number(satisfactionScore) : null,
        nextSteps: nextSteps || null,
      })
      .returning()

    return NextResponse.json({ meeting }, { status: 201 })
  } catch (error) {
    console.error("Error creating meeting:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE /api/meetings?id=X — Delete a meeting (employees only)
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const meetingId = searchParams.get("id")

  if (!meetingId) {
    return NextResponse.json({ error: "id requis" }, { status: 400 })
  }

  try {
    await db
      .delete(partnerMeetings)
      .where(eq(partnerMeetings.id, Number(meetingId)))

    return NextResponse.json({ message: "Réunion supprimée" })
  } catch (error) {
    console.error("Error deleting meeting:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
