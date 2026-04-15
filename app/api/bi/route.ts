import { NextRequest, NextResponse } from "next/server"
import { dwPool } from "@/backend/db/dw-config"
import { getSessionUser } from "@/backend/auth/session"

// GET /api/bi - BI dashboard data from DW
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    // Partners by category
    const byCategory = await dwPool.query(
      "SELECT partner_category, COUNT(*) as count FROM dim_partner GROUP BY partner_category ORDER BY count DESC"
    )

    // Partners by status
    const byStatus = await dwPool.query(
      "SELECT statut_partenariat, COUNT(*) as count FROM dim_partner GROUP BY statut_partenariat ORDER BY count DESC"
    )

    // Partners by level
    const byLevel = await dwPool.query(
      "SELECT partnership_level, COUNT(*) as count FROM dim_partner GROUP BY partnership_level ORDER BY count DESC"
    )

    // Top partners by revenue
    const topRevenue = await dwPool.query(
      `SELECT dp.name, dp.partner_category, fpa.annual_revenue_generated, fpa.satisfaction_score
       FROM fact_partner_activity fpa
       JOIN dim_partner dp ON dp.partner_key = fpa.partner_key
       WHERE fpa.annual_revenue_generated IS NOT NULL
       ORDER BY fpa.annual_revenue_generated DESC
       LIMIT 10`
    )

    // Events summary
    const eventsSummary = await dwPool.query(
      `SELECT COUNT(*) as total_events,
              SUM(num_participants) as total_participants,
              SUM(event_budget) as total_budget,
              SUM(event_revenue) as total_revenue
       FROM fact_events`
    )

    // Projects summary
    const projectsSummary = await dwPool.query(
      `SELECT COUNT(*) as total_projects,
              SUM(project_value) as total_value,
              AVG(client_satisfaction_score) as avg_satisfaction
       FROM fact_projects`
    )

    // University recruitment summary
    const recruitmentSummary = await dwPool.query(
      `SELECT COUNT(*) as total_students,
              SUM(converted_to_cdi::int) as total_cdi,
              AVG(satisfaction_score) as avg_satisfaction
       FROM fact_university_recruitment`
    )

    return NextResponse.json({
      byCategory: byCategory.rows,
      byStatus: byStatus.rows,
      byLevel: byLevel.rows,
      topRevenue: topRevenue.rows,
      eventsSummary: eventsSummary.rows[0],
      projectsSummary: projectsSummary.rows[0],
      recruitmentSummary: recruitmentSummary.rows[0],
    })
  } catch (error) {
    console.error("Error fetching BI data:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
