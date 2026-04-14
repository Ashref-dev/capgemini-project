import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { vendorProjects, technologyPartners } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq, sql, desc } from "drizzle-orm"

// GET /api/partner/projects — list projects for supplier/technology partner
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const partnerId = Number(user.sub)

  const techPartner = await db.query.technologyPartners.findFirst({
    where: eq(technologyPartners.partnerId, partnerId),
  })
  if (!techPartner) {
    return NextResponse.json({ error: "Accès réservé aux partenaires fournisseurs" }, { status: 403 })
  }

  try {
    const projects = await db
      .select()
      .from(vendorProjects)
      .where(eq(vendorProjects.technologyPartnerId, partnerId))
      .orderBy(desc(vendorProjects.startDate))

    // Own stats
    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) filter (where project_status = 'termine')::int`,
        inProgress: sql<number>`count(*) filter (where project_status = 'en_cours')::int`,
        totalValue: sql<number>`coalesce(sum(project_value), 0)::bigint`,
        avgSatisfaction: sql<number>`round(avg(client_satisfaction_score)::numeric, 1)`,
        onTime: sql<number>`count(*) filter (where delivery_status = 'a_temps' or delivery_status = 'en_avance')::int`,
      })
      .from(vendorProjects)
      .where(eq(vendorProjects.technologyPartnerId, partnerId))

    // Global stats for comparison
    const [globalStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) filter (where project_status = 'termine')::int`,
        avgSatisfaction: sql<number>`round(avg(client_satisfaction_score)::numeric, 1)`,
        avgValue: sql<number>`round(avg(project_value)::numeric, 0)`,
        onTimeRate: sql<number>`round(
          count(*) filter (where delivery_status = 'a_temps' or delivery_status = 'en_avance')::numeric /
          nullif(count(*) filter (where delivery_status is not null), 0) * 100, 1
        )`,
      })
      .from(vendorProjects)

    return NextResponse.json({
      projects,
      stats: {
        total: stats.total,
        completed: stats.completed,
        inProgress: stats.inProgress,
        totalValue: Number(stats.totalValue),
        avgSatisfaction: stats.avgSatisfaction,
        onTimeRate: stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0,
      },
      globalStats: {
        total: globalStats.total,
        completed: globalStats.completed,
        avgSatisfaction: globalStats.avgSatisfaction,
        avgValue: globalStats.avgValue ? Number(globalStats.avgValue) : 0,
        onTimeRate: globalStats.onTimeRate ? Number(globalStats.onTimeRate) : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/partner/projects — add a new project
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const partnerId = Number(user.sub)

  const techPartner = await db.query.technologyPartners.findFirst({
    where: eq(technologyPartners.partnerId, partnerId),
  })
  if (!techPartner) {
    return NextResponse.json({ error: "Accès réservé aux partenaires fournisseurs" }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (!body.projectName || !body.startDate) {
      return NextResponse.json({ error: "Le nom du projet et la date de début sont requis" }, { status: 400 })
    }

    const [project] = await db
      .insert(vendorProjects)
      .values({
        technologyPartnerId: partnerId,
        projectName: body.projectName,
        projectDescription: body.projectDescription || null,
        clientName: body.clientName || null,
        projectType: body.projectType || null,
        technologiesUsed: body.technologiesUsed || null,
        startDate: body.startDate,
        endDate: body.endDate || null,
        durationMonths: body.durationMonths ? Number(body.durationMonths) : null,
        projectValue: body.projectValue ? Number(body.projectValue) : null,
        licenseCost: body.licenseCost ? Number(body.licenseCost) : null,
        servicesCost: body.servicesCost ? Number(body.servicesCost) : null,
        commissionEarned: body.commissionEarned ? Number(body.commissionEarned) : null,
        deliveryStatus: body.deliveryStatus || null,
        delayDays: body.delayDays ? Number(body.delayDays) : null,
        budgetVariancePercentage: body.budgetVariancePercentage || null,
        clientSatisfactionScore: body.clientSatisfactionScore ? Number(body.clientSatisfactionScore) : null,
        numConsultantsCapgemini: body.numConsultantsCapgemini ? Number(body.numConsultantsCapgemini) : null,
        numConsultantsVendor: body.numConsultantsVendor ? Number(body.numConsultantsVendor) : null,
        projectStatus: body.projectStatus || "en_cours",
        isReferenceProject: body.isReferenceProject || false,
        caseStudyUrl: body.caseStudyUrl || null,
        notes: body.notes || null,
      })
      .returning()

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
