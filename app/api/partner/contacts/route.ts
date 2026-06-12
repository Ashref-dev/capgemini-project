import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partnerContacts } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { eq } from "drizzle-orm"

// GET /api/partner/contacts — list contacts for this partner
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const contacts = await db.query.partnerContacts.findMany({
      where: eq(partnerContacts.partnerId, partnerId),
      orderBy: (c, { desc }) => [desc(c.isPrimary)],
    })
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error("Error fetching partner contacts:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/partner/contacts — partner adds a new contact
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const body = await request.json()

    const newContact = await db
      .insert(partnerContacts)
      .values({
        partnerId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        role: body.role || null,
        isPrimary: body.isPrimary || false,
      })
      .returning()

    return NextResponse.json({ contact: newContact[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating partner contact:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
