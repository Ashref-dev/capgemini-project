import { desc, eq, sql } from "drizzle-orm"

import {
  clampScore,
  daysSince,
  formatCurrency,
  formatDecimal,
  formatInteger,
  formatPercent,
  formatReportDate,
  markdownTable,
  normalizeAmount,
  reportPreamble,
  sentenceCase,
  toWordList,
  type ReportPayload,
} from "../format"
import { db } from "@/lib/server/db/config"
import { dwPool } from "@/lib/server/db/dw-config"
import {
  offers,
  partnerEvents,
  partnerKpis,
  partnerMeetings,
  partners,
  partnerStatusHistory,
  studentRecruitments,
  universityPartners,
  vendorProjects,
} from "@/lib/server/db/schema"

export async function buildPartnerOverviewReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [categoryRows, statusRows, topRevenueRows, offerSummary, eventSummary, topSatisfactionRows] = await Promise.all([
    db
      .select({
        category: partners.categories,
        partnerCount: sql<number>`count(*)`,
        activeCount: sql<number>`count(*) filter (where ${partners.partnershipStatus} = 'actif')`,
        avgSatisfaction: sql<number>`coalesce(avg(${partners.satisfactionScore}), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${partners.annualRevenueGenerated}), 0)`,
        totalBudget: sql<number>`coalesce(sum(${partners.annualBudgetTnd}), 0)`,
      })
      .from(partners)
      .groupBy(partners.categories)
      .orderBy(partners.categories),
    db
      .select({
        status: partners.partnershipStatus,
        count: sql<number>`count(*)`,
      })
      .from(partners)
      .groupBy(partners.partnershipStatus)
      .orderBy(desc(sql<number>`count(*)`)),
    db
      .select({
        name: partners.name,
        category: partners.categories,
        partnershipLevel: partners.partnershipLevel,
        revenue: partners.annualRevenueGenerated,
        satisfaction: partners.satisfactionScore,
      })
      .from(partners)
      .orderBy(desc(partners.annualRevenueGenerated), desc(partners.satisfactionScore), partners.name)
      .limit(8),
    db
      .select({
        totalOffers: sql<number>`count(*)`,
        activeOffers: sql<number>`count(*) filter (where ${offers.isActive} = true)`,
        usageCount: sql<number>`coalesce(sum(${offers.usageCount}), 0)`,
        totalValue: sql<number>`coalesce(sum(${offers.totalValueTnd}), 0)`,
      })
      .from(offers),
    db
      .select({
        totalEvents: sql<number>`count(*)`,
        totalParticipants: sql<number>`coalesce(sum(${partnerEvents.numParticipants}), 0)`,
        totalLeads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        totalConversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
        totalBudget: sql<number>`coalesce(sum(${partnerEvents.eventBudget}), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${partnerEvents.satisfactionScore}), 0)`,
      })
      .from(partnerEvents),
    db
      .select({
        name: partners.name,
        category: partners.categories,
        satisfaction: partners.satisfactionScore,
        status: partners.partnershipStatus,
      })
      .from(partners)
      .orderBy(desc(partners.satisfactionScore), partners.name)
      .limit(5),
  ])

  const totalPartners = categoryRows.reduce((sum, row) => sum + normalizeAmount(row.partnerCount), 0)
  const activePartners = categoryRows.reduce((sum, row) => sum + normalizeAmount(row.activeCount), 0)
  const totalRevenue = categoryRows.reduce((sum, row) => sum + normalizeAmount(row.totalRevenue), 0)
  const totalBudget = categoryRows.reduce((sum, row) => sum + normalizeAmount(row.totalBudget), 0)
  const weightedSatisfaction = categoryRows.reduce(
    (sum, row) => sum + normalizeAmount(row.avgSatisfaction) * normalizeAmount(row.partnerCount),
    0
  )
  const portfolioSatisfaction = totalPartners > 0 ? weightedSatisfaction / totalPartners : 0
  const highestRevenueCategory = [...categoryRows].sort(
    (left, right) => normalizeAmount(right.totalRevenue) - normalizeAmount(left.totalRevenue)
  )[0]
  const largestCategory = [...categoryRows].sort(
    (left, right) => normalizeAmount(right.partnerCount) - normalizeAmount(left.partnerCount)
  )[0]
  const healthiestStatus = [...statusRows].sort((left, right) => normalizeAmount(right.count) - normalizeAmount(left.count))[0]

  let markdown = reportPreamble(title || "Partner Overview Report", "partner-overview", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `The current partnership portfolio covers **${formatInteger(totalPartners)} active records across four strategic categories**, creating a diversified base of universities, customers, marketing allies, and supplier relationships. ${formatInteger(activePartners)} partners are currently marked as active, which means roughly ${formatPercent(totalPartners > 0 ? (activePartners / totalPartners) * 100 : 0)} of the portfolio is in an operational state rather than negotiation, suspension, or transition. That active ratio matters because it shows the platform is not only accumulating names; it is sustaining relationships that can produce revenue, events, talent, or market access.\n\n`
  markdown += `Commercially, the portfolio currently points to **${formatCurrency(totalRevenue)} in declared partner-attributed annual revenue** and **${formatCurrency(totalBudget)} in combined annual budget capacity**. The strongest revenue concentration appears in **${sentenceCase(highestRevenueCategory?.category)}**, while the largest footprint by number of partnerships sits in **${sentenceCase(largestCategory?.category)}**. This mix indicates the business is not equally monetized across categories: some segments are broad but lighter in direct revenue, while others are smaller but more commercially dense. That distinction should guide where account leadership invests relationship-management time.\n\n`
  markdown += `Operationally, the ecosystem also shows meaningful engagement depth beyond static partner records. The platform contains **${formatInteger(eventSummary[0]?.totalEvents)} tracked partnership events**, **${formatInteger(offerSummary[0]?.totalOffers)} commercial offers**, and **${formatInteger(eventSummary[0]?.totalParticipants)} total event participants**. Event activity has already generated **${formatInteger(eventSummary[0]?.totalLeads)} leads** and **${formatInteger(eventSummary[0]?.totalConversions)} conversions**, while the mean portfolio satisfaction score is approximately **${formatDecimal(portfolioSatisfaction)} / 100**. Taken together, the data suggests the portfolio is not dormant; it is functioning as a relationship engine with measurable pipeline, brand, and talent outcomes.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Total partners", formatInteger(totalPartners)],
      ["Active partners", formatInteger(activePartners)],
      ["Portfolio satisfaction", `${formatDecimal(portfolioSatisfaction)} / 100`],
      ["Annual revenue generated", formatCurrency(totalRevenue)],
      ["Annual partner budgets", formatCurrency(totalBudget)],
      ["Tracked offers", formatInteger(offerSummary[0]?.totalOffers)],
      ["Active offers", formatInteger(offerSummary[0]?.activeOffers)],
      ["Tracked events", formatInteger(eventSummary[0]?.totalEvents)],
      ["Event leads / conversions", `${formatInteger(eventSummary[0]?.totalLeads)} / ${formatInteger(eventSummary[0]?.totalConversions)}`],
      ["Most represented status", sentenceCase(healthiestStatus?.status)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Category Breakdown\n\n"
  markdown += markdownTable(
    ["Category", "Partners", "Active", "Avg Satisfaction", "Revenue", "Budget"],
    categoryRows.map((row) => [
      sentenceCase(row.category),
      formatInteger(row.partnerCount),
      formatInteger(row.activeCount),
      formatDecimal(row.avgSatisfaction),
      formatCurrency(row.totalRevenue),
      formatCurrency(row.totalBudget),
    ])
  )
  markdown += "\n\n"
  markdown += `This breakdown shows where relationship density and economic weight diverge. A category can have a large number of partners but still underperform commercially if satisfaction is middling, offer usage is low, or event conversion is weak. In contrast, smaller categories with strong satisfaction and revenue may deserve greater executive sponsorship because each additional improvement there yields a disproportionate financial impact. The current portfolio therefore benefits from being managed as a segmented system rather than a flat partner list.\n\n`

  markdown += "## Commercial Leaders\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "Level", "Revenue", "Satisfaction"],
    topRevenueRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      sentenceCase(row.partnershipLevel),
      formatCurrency(row.revenue),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `The top revenue list highlights the partners that are already carrying the largest share of commercial output. These organizations should be treated as strategic accounts with proactive governance, not just periodic follow-up. Revenue concentration is healthy when it is backed by strong satisfaction and stable status, but it becomes a vulnerability when a few accounts contribute most of the value while showing softer sentiment or weaker engagement. The portfolio should therefore monitor not only which partners generate the most revenue, but also whether those same partners are receiving enough executive attention, offer renewal planning, and relationship maintenance.\n\n`

  markdown += "## Relationship Quality Signals\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "Status", "Satisfaction"],
    topSatisfactionRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      sentenceCase(row.status),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `High-satisfaction partners create more than goodwill. They tend to renew faster, accept broader collaboration, and generate stronger advocacy in the market. The presence of clear satisfaction leaders suggests Capgemini already has repeatable practices worth scaling: responsive governance, clearer joint planning, better event execution, or more targeted offers. The important next step is to translate those practices from isolated successes into a standard operating model for portfolio management. If the best-performing relationships remain exceptions, portfolio quality will stay uneven.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Protect the revenue core.** Launch quarterly executive reviews for the highest-revenue partners so commercial performance is matched with retention discipline and cross-sell planning.\n`
  markdown += `2. **Segment by value and maturity.** Use category-level signals to separate broad-network partners from high-yield strategic accounts, then assign different cadences, KPIs, and engagement motions.\n`
  markdown += `3. **Convert activity into pipeline.** Review offers and events together to determine where partner engagement is high but monetization remains low, especially where leads are generated without corresponding conversions.\n`
  markdown += `4. **Scale satisfaction playbooks.** Document the operating habits behind the highest-satisfaction partnerships and apply them to lower-performing accounts in the same category.\n`
  markdown += `5. **Track portfolio balance monthly.** Monitor partner count, active rate, revenue concentration, and satisfaction as one leadership dashboard so growth does not come at the expense of relationship quality.\n`

  return {
    title: title || "Partner Overview Report",
    markdown,
    topic: "partner-overview",
    generatedAt: generatedAt.toISOString(),
  }
}

export async function buildUniversityPartnershipsReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [universitySummary, universityLeaders, specializationRows, recruitmentTypeRows] = await Promise.all([
    db
      .select({
        totalUniversities: sql<number>`count(*)`,
        frameworkAgreements: sql<number>`count(*) filter (where ${universityPartners.hasFrameworkAgreement} = true)`,
        totalStudents: sql<number>`coalesce(sum(${universityPartners.numStudents}), 0)`,
        totalInternsPerYear: sql<number>`coalesce(sum(${universityPartners.numInternsPerYear}), 0)`,
        totalHiresPerYear: sql<number>`coalesce(sum(${universityPartners.numHiresPerYear}), 0)`,
        avgConversionToCdi: sql<number>`coalesce(avg(${universityPartners.conversionRateToCdi}), 0)`,
        avgSponsorshipBudget: sql<number>`coalesce(avg(${universityPartners.annualSponsorshipBudget}), 0)`,
        avgEventsPerYear: sql<number>`coalesce(avg(${universityPartners.numEventsPerYear}), 0)`,
      })
      .from(universityPartners),
    db
      .select({
        partnerName: partners.name,
        institutionType: universityPartners.institutionType,
        specialties: universityPartners.specialties,
        hiresPerYear: universityPartners.numHiresPerYear,
        conversionRate: universityPartners.conversionRateToCdi,
        sponsorshipBudget: universityPartners.annualSponsorshipBudget,
        recruitmentCount: sql<number>`count(${studentRecruitments.id})`,
        cdiCount: sql<number>`count(${studentRecruitments.id}) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(universityPartners)
      .innerJoin(partners, eq(partners.id, universityPartners.partnerId))
      .leftJoin(studentRecruitments, eq(studentRecruitments.universityPartnerId, universityPartners.partnerId))
      .groupBy(
        partners.name,
        universityPartners.partnerId,
        universityPartners.institutionType,
        universityPartners.specialties,
        universityPartners.numHiresPerYear,
        universityPartners.conversionRateToCdi,
        universityPartners.annualSponsorshipBudget
      )
      .orderBy(desc(sql<number>`count(${studentRecruitments.id}) filter (where ${studentRecruitments.convertedToCdi} = true)`), desc(sql<number>`count(${studentRecruitments.id})`), partners.name)
      .limit(8),
    db
      .select({
        specialization: studentRecruitments.specialization,
        count: sql<number>`count(*)`,
        cdiCount: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.specialization)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.specialization)
      .limit(8),
    db
      .select({
        recruitmentType: studentRecruitments.recruitmentType,
        count: sql<number>`count(*)`,
        cdiCount: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.recruitmentType)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.recruitmentType),
  ])

  const summary = universitySummary[0]
  const totalRecruitments = universityLeaders.reduce((sum, row) => sum + normalizeAmount(row.recruitmentCount), 0)
  const totalCdiConversions = universityLeaders.reduce((sum, row) => sum + normalizeAmount(row.cdiCount), 0)
  const leadingUniversity = universityLeaders[0]
  const dominantSpecialties = toWordList(
    specializationRows.slice(0, 3).map((row) => row.specialization ?? "Undeclared specialization")
  )

  let markdown = reportPreamble(title || "University Partnerships Report", "university-partnerships", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `Capgemini's university ecosystem currently includes **${formatInteger(summary?.totalUniversities)} academic partners**, with **${formatInteger(summary?.frameworkAgreements)} framework agreements** already formalized. These relationships represent access to approximately **${formatInteger(summary?.totalStudents)} students**, a recurring annual potential of **${formatInteger(summary?.totalInternsPerYear)} internships**, and **${formatInteger(summary?.totalHiresPerYear)} planned hires per year** based on partner-level declarations. The average conversion expectation to CDI sits at **${formatPercent(summary?.avgConversionToCdi)}**, which indicates that the university channel is not only a branding lever but a direct workforce pipeline.\n\n`
  markdown += `The operational recruitment dataset confirms that the channel is active rather than theoretical. The top tracked universities alone account for **${formatInteger(totalRecruitments)} recruitment records** and **${formatInteger(totalCdiConversions)} CDI conversions**, while average satisfaction and performance remain high enough to justify continued investment. This matters because university partnerships can easily become ceremonial if they are measured only by event presence or signed agreements. In this case, the platform data shows concrete movement from campus engagement to recruitment output.\n\n`
  markdown += `Thematically, the strongest recruiting demand is concentrated around **${dominantSpecialties}**, which gives the business a practical signal on where campus alignment is strongest today. This can inform event design, ambassador programs, internship capacity planning, and manager allocation. The presence of a clear university leader — currently **${leadingUniversity?.partnerName ?? "N/A"}** by tracked recruitment contribution — also creates a benchmark for what a mature academic partnership should look like in terms of conversion discipline, quality monitoring, and sponsorship return.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["University partners", formatInteger(summary?.totalUniversities)],
      ["Framework agreements", formatInteger(summary?.frameworkAgreements)],
      ["Student population reached", formatInteger(summary?.totalStudents)],
      ["Intern capacity per year", formatInteger(summary?.totalInternsPerYear)],
      ["Hire capacity per year", formatInteger(summary?.totalHiresPerYear)],
      ["Average CDI conversion target", formatPercent(summary?.avgConversionToCdi)],
      ["Average sponsorship budget", formatCurrency(summary?.avgSponsorshipBudget)],
      ["Average events per year", formatDecimal(summary?.avgEventsPerYear)],
      ["Tracked recruitments", formatInteger(totalRecruitments)],
      ["Tracked CDI conversions", formatInteger(totalCdiConversions)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Leading University Partners\n\n"
  markdown += markdownTable(
    ["University", "Institution Type", "Recruitments", "CDI", "Avg Performance", "Avg Satisfaction", "Conversion"],
    universityLeaders.map((row) => [
      row.partnerName,
      sentenceCase(row.institutionType),
      formatInteger(row.recruitmentCount),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
      formatPercent(row.conversionRate),
    ])
  )
  markdown += "\n\n"
  markdown += `The leading-university table shows where partnership maturity is already translating into measurable talent outcomes. Strong universities are not only those with a large student body; they are the ones where Capgemini is able to move candidates through placements, track performance, and convert the best profiles into longer-term contracts. The more balanced the mix between recruitment volume, CDI conversion, and satisfaction, the healthier the partnership. High volume without quality creates management overhead, while high quality without scale suggests untapped potential.\n\n`

  markdown += "## Talent Demand Patterns\n\n"
  markdown += markdownTable(
    ["Specialization", "Recruitments", "CDI", "Avg Performance"],
    specializationRows.map((row) => [
      row.specialization ?? "Undeclared",
      formatInteger(row.count),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
    ])
  )
  markdown += "\n\n"
  markdown += markdownTable(
    ["Recruitment Type", "Volume", "CDI", "Avg Satisfaction"],
    recruitmentTypeRows.map((row) => [
      sentenceCase(row.recruitmentType),
      formatInteger(row.count),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `These demand patterns are especially useful for planning the next academic cycle. If the platform is repeatedly converting the same specializations and recruitment types, Capgemini should formalize that signal into shared calendars with partner universities, focused employer-branding content, and manager-level workforce forecasts. Conversely, specializations with low conversion or weak performance may need better selection criteria, revised internship design, or tighter coordination between HR and technical teams. The value of this report is therefore not only descriptive; it indicates where the academic funnel is aligned and where it still leaks.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Deepen the top academic accounts.** Treat the best-performing universities as strategic talent pipelines with quarterly reviews, shared hiring plans, and earlier internship demand signals.\n`
  markdown += `2. **Use specialties to shape go-to-campus activity.** Align events, workshops, and ambassador programs around the specializations already producing the strongest conversion and performance outcomes.\n`
  markdown += `3. **Expand framework coverage selectively.** Universities without formal agreements but with visible recruitment contribution should be prioritized for structured partnership terms.\n`
  markdown += `4. **Track quality alongside volume.** Keep performance, satisfaction, and CDI conversion on the same scorecard so academic partnerships are measured by talent quality, not only student reach.\n`
  markdown += `5. **Link sponsorship to outcomes.** Compare sponsorship budgets with placement and conversion results to ensure campus investment is concentrated where Capgemini sees the strongest hiring return.\n`

  return {
    title: title || "University Partnerships Report",
    markdown,
    topic: "university-partnerships",
    generatedAt: generatedAt.toISOString(),
  }
}

export async function buildRevenueAnalysisReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [categoryRevenueRows, topRevenueRows, offerSummary, eventRevenueSummary, vendorProjectSummary, dwTopRevenue] = await Promise.all([
    db
      .select({
        category: partners.categories,
        partnerCount: sql<number>`count(*)`,
        totalRevenue: sql<number>`coalesce(sum(${partners.annualRevenueGenerated}), 0)`,
        avgRevenue: sql<number>`coalesce(avg(${partners.annualRevenueGenerated}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${partners.satisfactionScore}), 0)`,
      })
      .from(partners)
      .groupBy(partners.categories)
      .orderBy(desc(sql<number>`coalesce(sum(${partners.annualRevenueGenerated}), 0)`)),
    db
      .select({
        name: partners.name,
        category: partners.categories,
        revenue: partners.annualRevenueGenerated,
        budget: partners.annualBudgetTnd,
        satisfaction: partners.satisfactionScore,
      })
      .from(partners)
      .orderBy(desc(partners.annualRevenueGenerated), desc(partners.satisfactionScore), partners.name)
      .limit(10),
    db
      .select({
        totalOffers: sql<number>`count(*)`,
        activeOffers: sql<number>`count(*) filter (where ${offers.isActive} = true)`,
        totalOfferValue: sql<number>`coalesce(sum(${offers.totalValueTnd}), 0)`,
        avgOfferValue: sql<number>`coalesce(avg(${offers.totalValueTnd}), 0)`,
        totalUsage: sql<number>`coalesce(sum(${offers.usageCount}), 0)`,
      })
      .from(offers),
    db
      .select({
        totalEventRevenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        totalEventBudget: sql<number>`coalesce(sum(${partnerEvents.eventBudget}), 0)`,
        avgRoi: sql<number>`coalesce(avg(${partnerEvents.roiEvent}), 0)`,
        totalLeads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        totalConversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
      })
      .from(partnerEvents),
    db
      .select({
        totalProjects: sql<number>`count(*)`,
        totalProjectValue: sql<number>`coalesce(sum(${vendorProjects.projectValue}), 0)`,
        totalCommission: sql<number>`coalesce(sum(${vendorProjects.commissionEarned}), 0)`,
        avgClientSatisfaction: sql<number>`coalesce(avg(${vendorProjects.clientSatisfactionScore}), 0)`,
      })
      .from(vendorProjects),
    dwPool.query(`SELECT dp.name, dp.partner_category, fpa.annual_revenue_generated, fpa.satisfaction_score
      FROM fact_partner_activity fpa
      JOIN dim_partner dp ON dp.partner_key = fpa.partner_key
      WHERE fpa.annual_revenue_generated IS NOT NULL
      ORDER BY fpa.annual_revenue_generated DESC
      LIMIT 5`),
  ])

  const totalRevenue = categoryRevenueRows.reduce((sum, row) => sum + normalizeAmount(row.totalRevenue), 0)
  const topThreeRevenue = topRevenueRows.slice(0, 3).reduce((sum, row) => sum + normalizeAmount(row.revenue), 0)
  const topThreeShare = totalRevenue > 0 ? (topThreeRevenue / totalRevenue) * 100 : 0
  const largestRevenueCategory = categoryRevenueRows[0]

  let markdown = reportPreamble(title || "Revenue Analysis Report", "revenue-analysis", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `The current partnership portfolio reports **${formatCurrency(totalRevenue)} in annual revenue contribution** across all tracked partner categories. Revenue is not evenly distributed: the leading category is **${sentenceCase(largestRevenueCategory?.category)}**, and the top three partner accounts alone represent **${formatPercent(topThreeShare)}** of the total revenue base. This degree of concentration is commercially efficient when those relationships are healthy, but it also creates exposure if leadership attention, contract renewal planning, or satisfaction monitoring are weaker than the revenue profile warrants.\n\n`
  markdown += `The revenue engine is also supported by multiple monetization layers beyond direct partner revenue declarations. The platform tracks **${formatInteger(offerSummary[0]?.totalOffers)} offers** worth **${formatCurrency(offerSummary[0]?.totalOfferValue)}**, partnership events that have already produced **${formatCurrency(eventRevenueSummary[0]?.totalEventRevenue)}** in revenue against **${formatCurrency(eventRevenueSummary[0]?.totalEventBudget)}** in budget, and **${formatInteger(vendorProjectSummary[0]?.totalProjects)} vendor projects** representing **${formatCurrency(vendorProjectSummary[0]?.totalProjectValue)}** in project value. This means the partnership portfolio should be interpreted as a blended commercial system combining direct account contribution, campaign-style offer monetization, event activation, and delivery-side project economics.\n\n`
  markdown += `From a leadership perspective, the most important question is not simply where revenue exists today, but whether the pipeline is balanced enough for tomorrow. Healthy revenue growth requires three things at the same time: a protected top-account base, a mid-tier of scalable partners, and a clear operating mechanism for converting activity into future value. The current data suggests there is a strong top layer already in place, but also a case for stronger monetization discipline in events, offers, and vendor delivery relationships so the revenue model is more diversified.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Total annual partner revenue", formatCurrency(totalRevenue)],
      ["Top-three revenue share", formatPercent(topThreeShare)],
      ["Offers tracked / active", `${formatInteger(offerSummary[0]?.totalOffers)} / ${formatInteger(offerSummary[0]?.activeOffers)}`],
      ["Offer value", formatCurrency(offerSummary[0]?.totalOfferValue)],
      ["Offer usage count", formatInteger(offerSummary[0]?.totalUsage)],
      ["Event revenue", formatCurrency(eventRevenueSummary[0]?.totalEventRevenue)],
      ["Event budget", formatCurrency(eventRevenueSummary[0]?.totalEventBudget)],
      ["Average event ROI", formatDecimal(eventRevenueSummary[0]?.avgRoi, 2)],
      ["Vendor project value", formatCurrency(vendorProjectSummary[0]?.totalProjectValue)],
      ["Vendor commission earned", formatCurrency(vendorProjectSummary[0]?.totalCommission)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Revenue by Category\n\n"
  markdown += markdownTable(
    ["Category", "Partners", "Total Revenue", "Average Revenue", "Avg Satisfaction"],
    categoryRevenueRows.map((row) => [
      sentenceCase(row.category),
      formatInteger(row.partnerCount),
      formatCurrency(row.totalRevenue),
      formatCurrency(row.avgRevenue),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `This category view makes it easier to distinguish between scale and efficiency. Categories with high total revenue but lower average satisfaction may be commercially important but operationally fragile. Categories with smaller totals but stronger satisfaction can represent expansion opportunities if the account team builds more offers, events, or project motions around them. The right management action therefore depends on whether the category problem is concentration, under-penetration, or relationship quality.\n\n`

  markdown += "## Top Revenue Accounts\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "Revenue", "Budget", "Satisfaction"],
    topRevenueRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      formatCurrency(row.revenue),
      formatCurrency(row.budget),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `The top revenue accounts should be managed as a defended growth zone. In practical terms, that means clear executive sponsorship, visible renewal milestones, and deliberate cross-sell planning. Revenue-rich accounts with strong satisfaction are the best place to expand wallet share. Revenue-rich accounts with weaker satisfaction are a warning sign: the current numbers may still look good, but future revenue could be at risk if operational issues, delayed follow-up, or reduced engagement are left unresolved.\n\n`

  markdown += "## Data Warehouse Validation Snapshot\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "DW Revenue", "DW Satisfaction"],
    dwTopRevenue.rows.map((row) => [
      String(row.name ?? "N/A"),
      sentenceCase(typeof row.partner_category === "string" ? row.partner_category : null),
      formatCurrency(typeof row.annual_revenue_generated === "number" ? row.annual_revenue_generated : String(row.annual_revenue_generated ?? 0)),
      formatDecimal(typeof row.satisfaction_score === "number" ? row.satisfaction_score : String(row.satisfaction_score ?? 0)),
    ])
  )
  markdown += "\n\n"
  markdown += `The data warehouse snapshot serves as a secondary signal that the highest-value accounts are also visible in the BI model, which is important for cross-checking planning assumptions. Alignment between the operational database and BI revenue rankings increases trust in strategic reporting. When the same partners dominate both views, leadership can use them confidently for planning, while any divergence should trigger a data quality review or a deeper look at timing differences between operational updates and warehouse refreshes.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Reduce concentration risk.** Put quarterly retention and expansion plans in place for the top revenue accounts, especially where satisfaction is not proportionate to commercial contribution.\n`
  markdown += `2. **Scale the middle tier.** Identify medium-revenue partners with strong satisfaction and use offers, events, and account planning to move them into the top-commercial cohort.\n`
  markdown += `3. **Treat events and offers as monetization channels.** Review low-ROI activities and reallocate budget toward programs that generate measurable conversions and revenue.\n`
  markdown += `4. **Link delivery and revenue reporting.** Use vendor project value, commission, and satisfaction together to evaluate which supplier relationships deserve deeper strategic investment.\n`
  markdown += `5. **Institutionalize revenue reviews.** Combine operational and warehouse signals monthly so revenue, satisfaction, and concentration can be managed as one leadership conversation.\n`

  return {
    title: title || "Revenue Analysis Report",
    markdown,
    topic: "revenue-analysis",
    generatedAt: generatedAt.toISOString(),
  }
}

export type ChurnRiskProfile = {
  partnerId: number
  partnerName: string
  category: string | null
  overallRisk: number
  riskLevel: "high" | "medium" | "low"
  daysSinceLastInteraction: number
  latestSatisfaction: number
  satisfactionDrop: number
  concerningStatusChanges: number
  recentInteractions: number
}

export async function buildChurnRiskReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [partnerRows, eventRows, meetingRows, statusRows, kpiRows] = await Promise.all([
    db.select().from(partners).orderBy(partners.name),
    db
      .select({
        partnerId: partnerEvents.partnerId,
        eventDate: partnerEvents.eventDate,
      })
      .from(partnerEvents)
      .orderBy(desc(partnerEvents.eventDate)),
    db
      .select({
        partnerId: partnerMeetings.partnerId,
        meetingDate: partnerMeetings.meetingDate,
      })
      .from(partnerMeetings)
      .orderBy(desc(partnerMeetings.meetingDate)),
    db
      .select({
        partnerId: partnerStatusHistory.partnerId,
        newStatus: partnerStatusHistory.newStatus,
        changedAt: partnerStatusHistory.changedAt,
      })
      .from(partnerStatusHistory)
      .orderBy(desc(partnerStatusHistory.changedAt)),
    db
      .select({
        partnerId: partnerKpis.partnerId,
        avgSatisfactionScore: partnerKpis.avgSatisfactionScore,
        totalInteractions: partnerKpis.totalInteractions,
        year: partnerKpis.year,
        quarter: partnerKpis.quarter,
        month: partnerKpis.month,
      })
      .from(partnerKpis)
      .orderBy(desc(partnerKpis.year), desc(partnerKpis.quarter), desc(partnerKpis.month)),
  ])

  const eventsByPartner = new Map<number, Array<(typeof eventRows)[number]>>()
  const meetingsByPartner = new Map<number, Array<(typeof meetingRows)[number]>>()
  const statusesByPartner = new Map<number, Array<(typeof statusRows)[number]>>()
  const kpisByPartner = new Map<number, Array<(typeof kpiRows)[number]>>()

  for (const row of eventRows) {
    const collection = eventsByPartner.get(row.partnerId) ?? []
    collection.push(row)
    eventsByPartner.set(row.partnerId, collection)
  }

  for (const row of meetingRows) {
    const collection = meetingsByPartner.get(row.partnerId) ?? []
    collection.push(row)
    meetingsByPartner.set(row.partnerId, collection)
  }

  for (const row of statusRows) {
    const collection = statusesByPartner.get(row.partnerId) ?? []
    collection.push(row)
    statusesByPartner.set(row.partnerId, collection)
  }

  for (const row of kpiRows) {
    const collection = kpisByPartner.get(row.partnerId) ?? []
    collection.push(row)
    kpisByPartner.set(row.partnerId, collection)
  }

  const riskProfiles: ChurnRiskProfile[] = partnerRows.map((partner) => {
    const partnerEventsRows = (eventsByPartner.get(partner.id) ?? []).slice(0, 8)
    const partnerMeetingsRows = (meetingsByPartner.get(partner.id) ?? []).slice(0, 8)
    const partnerStatusRows = (statusesByPartner.get(partner.id) ?? []).slice(0, 8)
    const partnerKpiRows = (kpisByPartner.get(partner.id) ?? []).slice(0, 4)

    const lastInteractionDays = [
      daysSince(partner.lastEventDate),
      daysSince(partnerEventsRows[0]?.eventDate),
      daysSince(partnerMeetingsRows[0]?.meetingDate),
    ]
      .filter((value): value is number => value !== null)
      .sort((left, right) => left - right)[0] ?? 999

    const latestSatisfaction = normalizeAmount(partnerKpiRows[0]?.avgSatisfactionScore ?? partner.satisfactionScore)
    const previousSatisfaction = normalizeAmount(partnerKpiRows[1]?.avgSatisfactionScore ?? latestSatisfaction)
    const satisfactionDrop = Math.max(0, previousSatisfaction - latestSatisfaction)
    const statusWarnings = partnerStatusRows.filter((row) =>
      ["suspendu", "en négociation", "inactive"].includes((row.newStatus ?? "").toLowerCase())
    ).length
    const interactionCount =
      partnerEventsRows.length +
      partnerMeetingsRows.length +
      normalizeAmount(partnerKpiRows[0]?.totalInteractions)

    const inactivityRisk = clampScore((lastInteractionDays / 180) * 100)
    const satisfactionRisk = clampScore(satisfactionDrop * 12 + Math.max(0, 70 - latestSatisfaction))
    const statusRisk = clampScore(statusWarnings * 25)
    const engagementRisk = clampScore(Math.max(0, 80 - interactionCount * 8))
    const overallRisk = clampScore(
      inactivityRisk * 0.35 + satisfactionRisk * 0.3 + statusRisk * 0.2 + engagementRisk * 0.15
    )

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      category: partner.categories,
      overallRisk,
      riskLevel: overallRisk >= 70 ? "high" : overallRisk >= 40 ? "medium" : "low",
      daysSinceLastInteraction: lastInteractionDays,
      latestSatisfaction,
      satisfactionDrop,
      concerningStatusChanges: statusWarnings,
      recentInteractions: interactionCount,
    }
  })

  const rankedProfiles = [...riskProfiles].sort((left, right) => right.overallRisk - left.overallRisk)
  const highRiskCount = rankedProfiles.filter((profile) => profile.riskLevel === "high").length
  const mediumRiskCount = rankedProfiles.filter((profile) => profile.riskLevel === "medium").length
  const lowRiskCount = rankedProfiles.filter((profile) => profile.riskLevel === "low").length
  const averageRisk = rankedProfiles.length > 0 ? rankedProfiles.reduce((sum, row) => sum + row.overallRisk, 0) / rankedProfiles.length : 0
  const topRiskPartners = rankedProfiles.slice(0, 10)
  const highRiskByCategory = Array.from(
    rankedProfiles
      .filter((profile) => profile.riskLevel === "high")
      .reduce((map, profile) => {
        const key = sentenceCase(profile.category)
        map.set(key, (map.get(key) ?? 0) + 1)
        return map
      }, new Map<string, number>())
  ).sort((left, right) => right[1] - left[1])

  let markdown = reportPreamble(title || "Churn Risk Report", "churn-risk", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `The partnership base currently contains **${formatInteger(rankedProfiles.length)} analyzed partners**, with **${formatInteger(highRiskCount)} high-risk relationships**, **${formatInteger(mediumRiskCount)} medium-risk relationships**, and **${formatInteger(lowRiskCount)} low-risk relationships** according to interaction recency, satisfaction trend, status volatility, and engagement depth. The average portfolio risk score is **${formatDecimal(averageRisk)} / 100**, which means the overall relationship landscape is manageable but not risk-free. The most urgent issue is not the number of partners in the database, but the subset of relationships showing simultaneous signs of inactivity and weakening sentiment.\n\n`
  markdown += `In practice, churn rarely happens because of one signal alone. It usually appears when multiple weak indicators stack together: long gaps since the last event or meeting, a visible drop in satisfaction, repeated status changes toward suspended or uncertain states, and a low cadence of recent interactions. The current data reflects exactly that pattern in the upper end of the risk ranking. This is a positive sign for the model because it highlights actionable relationship-management gaps rather than random statistical noise.\n\n`
  markdown += `The report should therefore be used as a leadership operating tool, not just an analytical snapshot. High-risk accounts need rapid intervention. Medium-risk accounts need structured re-engagement before they deteriorate further. Low-risk accounts should not be ignored either; they represent the stable base that can absorb growth initiatives, pilot offers, and cross-category collaboration. The objective is not merely to avoid churn, but to maintain a balanced portfolio where commercial expansion does not outpace relationship health.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Partners analyzed", formatInteger(rankedProfiles.length)],
      ["Average risk score", formatDecimal(averageRisk)],
      ["High-risk partners", formatInteger(highRiskCount)],
      ["Medium-risk partners", formatInteger(mediumRiskCount)],
      ["Low-risk partners", formatInteger(lowRiskCount)],
      ["Highest-risk partner", topRiskPartners[0]?.partnerName ?? "N/A"],
      ["Highest-risk category", highRiskByCategory[0]?.[0] ?? "N/A"],
    ]
  )
  markdown += "\n\n"

  markdown += "## Highest-Risk Partners\n\n"
  markdown += markdownTable(
    ["Partner", "Category", "Risk", "Days Since Interaction", "Satisfaction", "Drop", "Status Warnings", "Interactions"],
    topRiskPartners.map((row) => [
      row.partnerName,
      sentenceCase(row.category),
      formatInteger(row.overallRisk),
      formatInteger(row.daysSinceLastInteraction),
      formatDecimal(row.latestSatisfaction),
      formatDecimal(row.satisfactionDrop),
      formatInteger(row.concerningStatusChanges),
      formatInteger(row.recentInteractions),
    ])
  )
  markdown += "\n\n"
  markdown += `The partners in this table require hands-on ownership rather than passive monitoring. Accounts with high risk and long inactivity windows should move to an immediate contact plan led by the business owner. Accounts with moderate inactivity but strong satisfaction decline may need service recovery rather than sales outreach. The real value of the ranking is that it helps distinguish which retention motion is appropriate: reactivation, escalation, executive sponsorship, or operational correction.\n\n`

  markdown += "## High-Risk Concentration by Category\n\n"
  markdown += markdownTable(
    ["Category", "High-Risk Partners"],
    highRiskByCategory.map(([category, count]) => [category, formatInteger(count)])
  )
  markdown += "\n\n"
  markdown += `Category concentration matters because churn is often systemic. If one category dominates the high-risk list, the issue may be structural: poor cadence, unclear ownership, weak service differentiation, or a category-specific value proposition that is no longer resonating. If risk is distributed evenly instead, the problem is more likely process-related across the entire portfolio. This category view therefore helps leadership decide whether to deploy targeted interventions or a broader relationship-governance reset.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Intervene within seven days for the top-risk cohort.** Assign owners and schedule executive or operational recovery touchpoints immediately for the highest-risk partners.\n`
  markdown += `2. **Separate inactivity from dissatisfaction.** Use the risk-driver pattern to decide whether each account needs re-engagement, service remediation, or commercial renegotiation.\n`
  markdown += `3. **Review unstable statuses in leadership meetings.** Repeated status degradation should trigger escalation because it often precedes churn before revenue visibly declines.\n`
  markdown += `4. **Create a medium-risk nurture cadence.** Monthly check-ins, lighter-touch events, or offer reviews can keep medium-risk accounts from sliding into the critical zone.\n`
  markdown += `5. **Embed churn review into portfolio governance.** Risk should be reviewed alongside revenue and satisfaction so account decisions are proactive rather than reactive.\n`

  return {
    title: title || "Churn Risk Report",
    markdown,
    topic: "churn-risk",
    generatedAt: generatedAt.toISOString(),
  }
}

export async function buildRecruitmentPerformanceReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [summaryRows, universityRows, typeRows, teamRows, specializationRows] = await Promise.all([
    db
      .select({
        totalRecruitments: sql<number>`count(*)`,
        totalCdi: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
        avgDuration: sql<number>`coalesce(avg(${studentRecruitments.contractDurationMonths}), 0)`,
      })
      .from(studentRecruitments),
    db
      .select({
        partnerName: partners.name,
        recruitments: sql<number>`count(${studentRecruitments.id})`,
        cdiCount: sql<number>`count(${studentRecruitments.id}) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(studentRecruitments)
      .innerJoin(universityPartners, eq(universityPartners.partnerId, studentRecruitments.universityPartnerId))
      .innerJoin(partners, eq(partners.id, universityPartners.partnerId))
      .groupBy(partners.name, universityPartners.partnerId)
      .orderBy(desc(sql<number>`count(${studentRecruitments.id}) filter (where ${studentRecruitments.convertedToCdi} = true)`), desc(sql<number>`count(${studentRecruitments.id})`), partners.name)
      .limit(8),
    db
      .select({
        recruitmentType: studentRecruitments.recruitmentType,
        count: sql<number>`count(*)`,
        cdiCount: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.recruitmentType)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.recruitmentType),
    db
      .select({
        assignedTeam: studentRecruitments.assignedTeam,
        count: sql<number>`count(*)`,
        cdiCount: sql<number>`count(*) filter (where ${studentRecruitments.convertedToCdi} = true)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.assignedTeam)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.assignedTeam)
      .limit(8),
    db
      .select({
        specialization: studentRecruitments.specialization,
        count: sql<number>`count(*)`,
        avgPerformance: sql<number>`coalesce(avg(${studentRecruitments.performanceScore}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${studentRecruitments.satisfactionScore}), 0)`,
      })
      .from(studentRecruitments)
      .groupBy(studentRecruitments.specialization)
      .orderBy(desc(sql<number>`count(*)`), studentRecruitments.specialization)
      .limit(8),
  ])

  const summary = summaryRows[0]
  const conversionRate = normalizeAmount(summary?.totalRecruitments) > 0
    ? (normalizeAmount(summary?.totalCdi) / normalizeAmount(summary?.totalRecruitments)) * 100
    : 0

  let markdown = reportPreamble(title || "Recruitment Performance Report", "recruitment-performance", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `The recruitment pipeline sourced through university partnerships currently includes **${formatInteger(summary?.totalRecruitments)} tracked recruitment records**, of which **${formatInteger(summary?.totalCdi)} have converted to CDI**. That translates into an observed conversion rate of **${formatPercent(conversionRate)}**, supported by an average performance score of **${formatDecimal(summary?.avgPerformance)}** and average satisfaction of **${formatDecimal(summary?.avgSatisfaction)}**. These are strong signals that the recruitment funnel is producing not just volume, but a meaningful level of hiring quality and candidate experience.\n\n`
  markdown += `The next level of analysis is operational: which universities feed the best hires, which recruitment types convert most efficiently, and which teams absorb the largest share of incoming talent. That matters because recruitment performance can look positive in aggregate while still hiding avoidable inefficiencies. For example, some channels may generate many placements but weaker CDI conversion, while others create fewer hires but much stronger long-term fit. The best hiring strategy is therefore one that optimizes quality and retention, not only throughput.\n\n`
  markdown += `The dataset also provides a bridge between HR planning and partnership management. Because the source universities, assigned teams, specializations, and conversion outcomes are all visible, the platform can move beyond anecdotal campus preferences and toward evidence-based workforce sourcing. This is especially useful for prioritizing future events, internship quotas, manager preparation, and budget allocation for the academic pipeline.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Tracked recruitments", formatInteger(summary?.totalRecruitments)],
      ["CDI conversions", formatInteger(summary?.totalCdi)],
      ["Observed CDI conversion rate", formatPercent(conversionRate)],
      ["Average performance score", formatDecimal(summary?.avgPerformance)],
      ["Average satisfaction score", formatDecimal(summary?.avgSatisfaction)],
      ["Average contract duration (months)", formatDecimal(summary?.avgDuration)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Top Source Universities\n\n"
  markdown += markdownTable(
    ["University", "Recruitments", "CDI", "Avg Performance", "Avg Satisfaction"],
    universityRows.map((row) => [
      row.partnerName,
      formatInteger(row.recruitments),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `University performance should be read as a mix of scale and fit. A strong source university is one that consistently delivers candidates who perform well, integrate successfully into teams, and convert into long-term hires at an acceptable rate. Universities that generate volume without quality should be coached differently from universities that produce a smaller number of highly successful placements. This distinction helps HR teams focus their campus strategy and helps partnership managers justify deeper academic engagement where results are strongest.\n\n`

  markdown += "## Recruitment Mix\n\n"
  markdown += markdownTable(
    ["Recruitment Type", "Volume", "CDI", "Avg Performance", "Avg Satisfaction"],
    typeRows.map((row) => [
      sentenceCase(row.recruitmentType),
      formatInteger(row.count),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += markdownTable(
    ["Assigned Team", "Recruitments", "CDI"],
    teamRows.map((row) => [
      row.assignedTeam ?? "Unassigned",
      formatInteger(row.count),
      formatInteger(row.cdiCount),
    ])
  )
  markdown += "\n\n"
  markdown += `This mix view shows how the recruitment engine is being consumed internally. If a few teams receive most candidates, they may require stronger onboarding capacity, clearer mentoring structures, or better forecasting to preserve candidate experience. If certain recruitment types show lower CDI outcomes, HR may want to revisit the selection process, scope of assignments, or transition pathways from early-stage contract to permanent role. The operational lesson is that recruitment performance belongs jointly to sourcing quality and receiving-team readiness.\n\n`

  markdown += "## Skill Alignment\n\n"
  markdown += markdownTable(
    ["Specialization", "Volume", "Avg Performance", "Avg Satisfaction"],
    specializationRows.map((row) => [
      row.specialization ?? "Undeclared",
      formatInteger(row.count),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `Specialization patterns show where campus supply and Capgemini demand are best aligned. High-volume, high-performance specializations should receive more proactive campus programming and manager-level forecasting, because they already represent validated talent pools. Lower-performing specializations may need better screening, revised role matching, or a narrower target list of partner schools. This section is especially valuable for converting raw hiring data into targeted academic partnership strategy.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Prioritize quality-producing universities.** Increase engagement with institutions that combine strong recruitment volume, performance, and CDI conversion.\n`
  markdown += `2. **Tune the recruitment mix.** Review recruitment types with weaker long-term conversion and refine the pathway from internship or alternance to CDI.\n`
  markdown += `3. **Coordinate with hiring teams earlier.** Use team-level intake patterns to forecast manager demand and avoid last-minute placement friction.\n`
  markdown += `4. **Focus on validated skill pools.** Direct campus events, branding, and academic collaboration toward the specializations already showing strong performance outcomes.\n`
  markdown += `5. **Track recruitment performance monthly.** Keep conversion, satisfaction, and performance visible in the same dashboard so growth in volume does not reduce hiring quality.\n`

  return {
    title: title || "Recruitment Performance Report",
    markdown,
    topic: "recruitment-performance",
    generatedAt: generatedAt.toISOString(),
  }
}

export async function buildEventImpactReport(title?: string): Promise<ReportPayload> {
  const generatedAt = new Date()

  const [eventSummaryRows, eventTypeRows, topEvents, categoryRows] = await Promise.all([
    db
      .select({
        totalEvents: sql<number>`count(*)`,
        totalParticipants: sql<number>`coalesce(sum(${partnerEvents.numParticipants}), 0)`,
        totalLeads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        totalConversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
        totalBudget: sql<number>`coalesce(sum(${partnerEvents.eventBudget}), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        avgSatisfaction: sql<number>`coalesce(avg(${partnerEvents.satisfactionScore}), 0)`,
        avgRoi: sql<number>`coalesce(avg(${partnerEvents.roiEvent}), 0)`,
      })
      .from(partnerEvents),
    db
      .select({
        eventType: partnerEvents.eventType,
        count: sql<number>`count(*)`,
        participants: sql<number>`coalesce(sum(${partnerEvents.numParticipants}), 0)`,
        leads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        conversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
        revenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        avgRoi: sql<number>`coalesce(avg(${partnerEvents.roiEvent}), 0)`,
      })
      .from(partnerEvents)
      .groupBy(partnerEvents.eventType)
      .orderBy(desc(sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`), partnerEvents.eventType),
    db
      .select({
        eventName: partnerEvents.eventName,
        partnerName: partners.name,
        eventType: partnerEvents.eventType,
        eventDate: partnerEvents.eventDate,
        participants: partnerEvents.numParticipants,
        leads: partnerEvents.numLeadsGenerated,
        conversions: partnerEvents.numConversions,
        revenue: partnerEvents.eventRevenue,
        roi: partnerEvents.roiEvent,
        satisfaction: partnerEvents.satisfactionScore,
      })
      .from(partnerEvents)
      .innerJoin(partners, eq(partners.id, partnerEvents.partnerId))
      .orderBy(desc(partnerEvents.eventRevenue), desc(partnerEvents.roiEvent), desc(partnerEvents.numConversions))
      .limit(8),
    db
      .select({
        category: partners.categories,
        eventCount: sql<number>`count(${partnerEvents.id})`,
        revenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`,
        leads: sql<number>`coalesce(sum(${partnerEvents.numLeadsGenerated}), 0)`,
        conversions: sql<number>`coalesce(sum(${partnerEvents.numConversions}), 0)`,
      })
      .from(partnerEvents)
      .innerJoin(partners, eq(partners.id, partnerEvents.partnerId))
      .groupBy(partners.categories)
      .orderBy(desc(sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)`), partners.categories),
  ])

  const summary = eventSummaryRows[0]
  const conversionRate = normalizeAmount(summary?.totalLeads) > 0
    ? (normalizeAmount(summary?.totalConversions) / normalizeAmount(summary?.totalLeads)) * 100
    : 0
  const revenueToBudget = normalizeAmount(summary?.totalBudget) > 0
    ? (normalizeAmount(summary?.totalRevenue) / normalizeAmount(summary?.totalBudget)) * 100
    : 0

  let markdown = reportPreamble(title || "Event Impact Report", "event-impact", generatedAt)
  markdown += "## Executive Summary\n\n"
  markdown += `Partnership events remain one of the most visible activation channels in the portfolio. The platform currently records **${formatInteger(summary?.totalEvents)} events**, bringing together **${formatInteger(summary?.totalParticipants)} participants**, generating **${formatInteger(summary?.totalLeads)} leads**, and converting **${formatInteger(summary?.totalConversions)} of those leads** into downstream outcomes. Financially, the event layer represents **${formatCurrency(summary?.totalRevenue)} in event-linked revenue** against **${formatCurrency(summary?.totalBudget)} in event spend**, while participant satisfaction averages **${formatDecimal(summary?.avgSatisfaction)} / 100**.\n\n`
  markdown += `Those results indicate the event engine is doing more than brand visibility. It is contributing measurable pipeline and commercial value, with a lead-to-conversion rate of **${formatPercent(conversionRate)}** and a revenue-to-budget ratio of **${formatPercent(revenueToBudget)}**. That said, event programs should still be managed carefully: high attendance does not automatically mean high business impact, and attractive revenue totals can hide weak efficiency if ROI is inconsistent across event types or partner categories.\n\n`
  markdown += `The most useful leadership question is therefore: which event formats create the best combination of visibility, pipeline, and economics? The tables below answer that by breaking impact down by event type, by category, and by individual event leaders. This allows Capgemini to decide where to scale, where to redesign, and where to reduce spend if the commercial return is no longer compelling.\n\n`

  markdown += "## Key Metrics\n\n"
  markdown += markdownTable(
    ["Metric", "Value"],
    [
      ["Tracked events", formatInteger(summary?.totalEvents)],
      ["Participants", formatInteger(summary?.totalParticipants)],
      ["Leads generated", formatInteger(summary?.totalLeads)],
      ["Conversions", formatInteger(summary?.totalConversions)],
      ["Lead-to-conversion rate", formatPercent(conversionRate)],
      ["Event budget", formatCurrency(summary?.totalBudget)],
      ["Event revenue", formatCurrency(summary?.totalRevenue)],
      ["Revenue-to-budget ratio", formatPercent(revenueToBudget)],
      ["Average event satisfaction", formatDecimal(summary?.avgSatisfaction)],
      ["Average event ROI", formatDecimal(summary?.avgRoi, 2)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Event Performance by Type\n\n"
  markdown += markdownTable(
    ["Event Type", "Events", "Participants", "Leads", "Conversions", "Revenue", "Avg ROI"],
    eventTypeRows.map((row) => [
      sentenceCase(row.eventType),
      formatInteger(row.count),
      formatInteger(row.participants),
      formatInteger(row.leads),
      formatInteger(row.conversions),
      formatCurrency(row.revenue),
      formatDecimal(row.avgRoi, 2),
    ])
  )
  markdown += "\n\n"
  markdown += `Different event types create different kinds of value. Some formats are better at awareness and participation, while others are better at lead capture or revenue creation. The practical implication is that event planning should use a portfolio approach: awareness-oriented events can still be justified, but they should not consume the same budget logic as conversion-oriented programs. The strongest event strategy is one that clearly distinguishes branding, demand generation, recruitment activation, and relationship maintenance.\n\n`

  markdown += "## Top Performing Events\n\n"
  markdown += markdownTable(
    ["Event", "Partner", "Type", "Date", "Leads", "Conversions", "Revenue", "ROI", "Satisfaction"],
    topEvents.map((row) => [
      row.eventName,
      row.partnerName,
      sentenceCase(row.eventType),
      formatReportDate(row.eventDate),
      formatInteger(row.leads),
      formatInteger(row.conversions),
      formatCurrency(row.revenue),
      formatDecimal(row.roi, 2),
      formatInteger(row.satisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `Top-performing events should be treated as repeatable operating models, not one-off successes. If a small set of events repeatedly combine strong conversion, revenue, and participant satisfaction, they should become templates for future planning. The underlying drivers may include partner fit, target audience clarity, event content quality, or better post-event follow-up. Replicating those mechanics is usually more valuable than simply increasing the total number of events.\n\n`

  markdown += "## Event Contribution by Partner Category\n\n"
  markdown += markdownTable(
    ["Category", "Events", "Revenue", "Leads", "Conversions"],
    categoryRows.map((row) => [
      sentenceCase(row.category),
      formatInteger(row.eventCount),
      formatCurrency(row.revenue),
      formatInteger(row.leads),
      formatInteger(row.conversions),
    ])
  )
  markdown += "\n\n"
  markdown += `Category-level event contribution shows whether the event engine is balanced or over-dependent on one partner segment. If one category dominates revenue while another dominates participation, Capgemini should decide intentionally whether that mix reflects strategy or simply historical habit. This distinction helps budget owners decide where to scale proven formats and where to redesign event models that are visible but commercially weak.\n\n`

  markdown += "## Recommendations\n\n"
  markdown += `1. **Double down on high-return formats.** Replicate the event structures that already combine revenue, conversions, and strong participant satisfaction.\n`
  markdown += `2. **Separate awareness KPIs from commercial KPIs.** Avoid judging brand-building events and revenue-driving events by the same success criteria.\n`
  markdown += `3. **Tighten post-event follow-up.** Events with strong lead generation but weaker conversion need better handoff into account, HR, or campaign workflows.\n`
  markdown += `4. **Review category allocation.** Compare event spend and outcomes by partner category to ensure resources align with strategic goals, not just historical calendars.\n`
  markdown += `5. **Institutionalize event ROI reviews.** Add monthly event-performance checkpoints so future budgets are guided by evidence instead of attendance alone.\n`

  return {
    title: title || "Event Impact Report",
    markdown,
    topic: "event-impact",
    generatedAt: generatedAt.toISOString(),
  }
}
