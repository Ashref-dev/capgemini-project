import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { studentRecruitments } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { validatePartnerId } from "@/backend/services/validate-partner"
import { eq } from "drizzle-orm"

function isHrOrAdmin(role?: string) {
  return role === "rh" || role === "admin"
}

function canReadRecruitments(role?: string) {
  return role === "rh" || role === "admin" || role === "manager"
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!canReadRecruitments(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const recruitments = await db.query.studentRecruitments.findMany({
      with: { universityPartner: true },
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    })
    return NextResponse.json({ recruitments })
  } catch (error) {
    console.error("Error fetching recruitments:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/hr/recruitments — Create a new recruitment
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isHrOrAdmin(user.role)) {
    return NextResponse.json({ error: "Accès réservé aux RH et administrateurs" }, { status: 403 })
  }

  try {
    const body = await request.json()

    const partnerCheck = await validatePartnerId(body.universityPartnerId, { category: "university" })
    if (!partnerCheck.ok) {
      return NextResponse.json({ error: partnerCheck.error }, { status: partnerCheck.status })
    }
    if (!body.startDate) {
      return NextResponse.json({ error: "Date de début requise" }, { status: 400 })
    }

    const newRecruitment = await db
      .insert(studentRecruitments)
      .values({
        universityPartnerId: partnerCheck.id,
        studentFirstName: body.studentFirstName || null,
        studentLastName: body.studentLastName || null,
        studentEmail: body.studentEmail || null,
        studentPhone: body.studentPhone || null,
        recruitmentType: body.recruitmentType || null,
        contractDurationMonths: body.contractDurationMonths ? Number(body.contractDurationMonths) : null,
        startDate: body.startDate,
        endDate: body.endDate || null,
        degreeLevel: body.degreeLevel || null,
        specialization: body.specialization || null,
        skills: body.skills || null,
        assignedProject: body.assignedProject || null,
        assignedTeam: body.assignedTeam || null,
        managerName: body.managerName || null,
        managerEmail: body.managerEmail || null,
        performanceScore: body.performanceScore ? Number(body.performanceScore) : null,
        satisfactionScore: body.satisfactionScore ? Number(body.satisfactionScore) : null,
        convertedToCdi: body.convertedToCdi || false,
        notes: body.notes || null,
      })
      .returning()

    return NextResponse.json({ recruitment: newRecruitment[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating recruitment:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}

// DELETE /api/hr/recruitments?id=X
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isHrOrAdmin(user.role)) {
    return NextResponse.json({ error: "Accès réservé aux RH et administrateurs" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    await db.delete(studentRecruitments).where(eq(studentRecruitments.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting recruitment:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
