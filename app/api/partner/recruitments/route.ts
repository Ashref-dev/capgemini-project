import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { studentRecruitments, universityPartners } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq, sql, and, desc } from "drizzle-orm"

// GET /api/partner/recruitments — list recruitments for university partner
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const partnerId = Number(user.sub)

  // Verify this partner is a university partner
  const uniPartner = await db.query.universityPartners.findFirst({
    where: eq(universityPartners.partnerId, partnerId),
  })
  if (!uniPartner) {
    return NextResponse.json({ error: "Accès réservé aux partenaires universitaires" }, { status: 403 })
  }

  try {
    const recruitments = await db
      .select()
      .from(studentRecruitments)
      .where(eq(studentRecruitments.universityPartnerId, partnerId))
      .orderBy(desc(studentRecruitments.startDate))

    // Stats
    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        converted: sql<number>`count(*) filter (where converted_to_cdi = true)::int`,
        avgPerformance: sql<number>`round(avg(performance_score)::numeric, 1)`,
        avgSatisfaction: sql<number>`round(avg(satisfaction_score)::numeric, 1)`,
      })
      .from(studentRecruitments)
      .where(eq(studentRecruitments.universityPartnerId, partnerId))

    // Global recruitment stats for comparison
    const [globalStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        converted: sql<number>`count(*) filter (where converted_to_cdi = true)::int`,
        avgPerformance: sql<number>`round(avg(performance_score)::numeric, 1)`,
        avgSatisfaction: sql<number>`round(avg(satisfaction_score)::numeric, 1)`,
      })
      .from(studentRecruitments)

    return NextResponse.json({
      recruitments,
      stats: {
        total: stats.total,
        converted: stats.converted,
        conversionRate: stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0,
        avgPerformance: stats.avgPerformance,
        avgSatisfaction: stats.avgSatisfaction,
      },
      globalStats: {
        total: globalStats.total,
        converted: globalStats.converted,
        conversionRate: globalStats.total > 0 ? Math.round((globalStats.converted / globalStats.total) * 100) : 0,
        avgPerformance: globalStats.avgPerformance,
        avgSatisfaction: globalStats.avgSatisfaction,
      },
    })
  } catch (error) {
    console.error("Error fetching recruitments:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/partner/recruitments — add a new recruitment
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const partnerId = Number(user.sub)

  const uniPartner = await db.query.universityPartners.findFirst({
    where: eq(universityPartners.partnerId, partnerId),
  })
  if (!uniPartner) {
    return NextResponse.json({ error: "Accès réservé aux partenaires universitaires" }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (!body.startDate) {
      return NextResponse.json({ error: "La date de début est requise" }, { status: 400 })
    }

    const [recruitment] = await db
      .insert(studentRecruitments)
      .values({
        universityPartnerId: partnerId,
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
        cdiStartDate: body.cdiStartDate || null,
        cdiSalaryRange: body.cdiSalaryRange || null,
        notes: body.notes || null,
      })
      .returning()

    return NextResponse.json({ recruitment }, { status: 201 })
  } catch (error) {
    console.error("Error creating recruitment:", error instanceof Error ? error.message : error)
    if (error && typeof error === "object" && "cause" in error) {
      console.error("Cause:", (error as any).cause?.message || (error as any).cause)
    }
    return NextResponse.json({ error: "Erreur lors de la création", detail: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
