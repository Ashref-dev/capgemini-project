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

  let markdown = reportPreamble(title || "Rapport d'aperçu du portefeuille partenaires", "partner-overview", generatedAt)
  markdown += "## Résumé exécutif\n\n"
  markdown += `Le portefeuille partenarial actuel couvre **${formatInteger(totalPartners)} enregistrements actifs répartis sur quatre catégories stratégiques**, constituant une base diversifiée d'universités, de clients, d'alliés marketing et de relations fournisseurs. **${formatInteger(activePartners)} partenaires** sont actuellement marqués comme actifs, soit environ **${formatPercent(totalPartners > 0 ? (activePartners / totalPartners) * 100 : 0)}** du portefeuille dans un état opérationnel plutôt qu'en négociation, en suspension ou en transition. Ce taux d'activité est important, car il montre que la plateforme n'accumule pas seulement des noms, elle entretient des relations capables de générer du chiffre d'affaires, des événements, des talents ou de l'accès au marché.\n\n`
  markdown += `Sur le plan commercial, le portefeuille affiche actuellement **${formatCurrency(totalRevenue)} de chiffre d'affaires annuel attribué aux partenaires** et **${formatCurrency(totalBudget)} de capacité budgétaire annuelle cumulée**. La concentration de revenus la plus forte apparaît dans **${sentenceCase(highestRevenueCategory?.category)}**, tandis que l'empreinte la plus large en nombre de partenariats se situe dans **${sentenceCase(largestCategory?.category)}**. Ce profil indique que l'activité n'est pas monétisée de manière homogène selon les catégories, certains segments étant larges mais moins générateurs de revenus directs, tandis que d'autres sont plus compacts mais beaucoup plus denses commercialement. Cette distinction doit guider la répartition du temps consacré au pilotage des comptes.\n\n`
  markdown += `Sur le plan opérationnel, l'écosystème révèle aussi une profondeur d'engagement réelle au-delà des simples fiches partenaires. La plateforme recense **${formatInteger(eventSummary[0]?.totalEvents)} événements partenaires suivis**, **${formatInteger(offerSummary[0]?.totalOffers)} offres commerciales** et **${formatInteger(eventSummary[0]?.totalParticipants)} participants aux événements**. L'activité événementielle a déjà généré **${formatInteger(eventSummary[0]?.totalLeads)} leads** et **${formatInteger(eventSummary[0]?.totalConversions)} conversions**, tandis que le score moyen de satisfaction du portefeuille s'établit à **${formatDecimal(portfolioSatisfaction)} / 100**. Ensemble, ces données montrent que le portefeuille n'est pas dormant, mais fonctionne comme un moteur relationnel produisant des résultats mesurables en pipeline, en image de marque et en talents.\n\n`

  markdown += "## Indicateurs clés\n\n"
  markdown += markdownTable(
    ["Indicateur", "Valeur"],
    [
      ["Partenaires totaux", formatInteger(totalPartners)],
      ["Partenaires actifs", formatInteger(activePartners)],
      ["Satisfaction du portefeuille", `${formatDecimal(portfolioSatisfaction)} / 100`],
      ["Chiffre d'affaires annuel généré", formatCurrency(totalRevenue)],
      ["Budgets annuels partenaires", formatCurrency(totalBudget)],
      ["Offres suivies", formatInteger(offerSummary[0]?.totalOffers)],
      ["Offres actives", formatInteger(offerSummary[0]?.activeOffers)],
      ["Événements suivis", formatInteger(eventSummary[0]?.totalEvents)],
      ["Leads / conversions des événements", `${formatInteger(eventSummary[0]?.totalLeads)} / ${formatInteger(eventSummary[0]?.totalConversions)}`],
      ["Statut le plus représenté", sentenceCase(healthiestStatus?.status)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Répartition par catégorie\n\n"
  markdown += markdownTable(
    ["Catégorie", "Partenaires", "Actifs", "Satisfaction moyenne", "Revenu", "Budget"],
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
  markdown += `Cette répartition montre où la densité relationnelle et le poids économique divergent. Une catégorie peut compter de nombreux partenaires tout en restant sous-performante commercialement si la satisfaction est moyenne, si l'utilisation des offres est faible ou si la conversion événementielle est limitée. À l'inverse, des catégories plus petites mais plus performantes en satisfaction et en revenus peuvent mériter un parrainage exécutif plus fort, car chaque amélioration supplémentaire y produit un impact financier disproportionné. Le portefeuille gagne donc à être piloté comme un ensemble segmenté plutôt que comme une simple liste de partenaires.\n\n`

  markdown += "## Principaux partenaires commerciaux\n\n"
  markdown += markdownTable(
    ["Partenaire", "Catégorie", "Niveau", "Revenu", "Satisfaction"],
    topRevenueRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      sentenceCase(row.partnershipLevel),
      formatCurrency(row.revenue),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `La liste des plus gros générateurs de revenus met en évidence les partenaires qui portent déjà la plus grande part de la production commerciale. Ces organisations doivent être traitées comme des comptes stratégiques, avec une gouvernance proactive et non un simple suivi périodique. La concentration de revenus est saine lorsqu'elle s'appuie sur une forte satisfaction et un statut stable, mais elle devient une vulnérabilité lorsque quelques comptes concentrent l'essentiel de la valeur tout en affichant un sentiment plus faible ou un engagement moindre. Le portefeuille doit donc surveiller non seulement les partenaires qui génèrent le plus de revenus, mais aussi vérifier si ces mêmes partenaires reçoivent suffisamment d'attention exécutive, de planification de renouvellement des offres et de maintien relationnel.\n\n`

  markdown += "## Signaux de qualité relationnelle\n\n"
  markdown += markdownTable(
    ["Partenaire", "Catégorie", "Statut", "Satisfaction"],
    topSatisfactionRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      sentenceCase(row.status),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `Les partenaires les plus satisfaits produisent davantage qu'un simple climat favorable. Ils renouvellent plus vite, acceptent des collaborations plus larges et génèrent un meilleur relais de confiance sur le marché. La présence de leaders clairs en matière de satisfaction montre que Capgemini dispose déjà de pratiques reproductibles qu'il serait pertinent de généraliser, comme une gouvernance réactive, une planification conjointe plus lisible, une meilleure exécution événementielle ou des offres plus ciblées. L'étape suivante consiste à transformer ces réussites isolées en modèle opérationnel standard pour le pilotage du portefeuille. Tant que les meilleures relations restent des exceptions, la qualité du portefeuille restera inégale.\n\n`

  markdown += "## Recommandations\n\n"
  markdown += `1. **Protéger le cœur de revenus.** Lancer des revues exécutives trimestrielles pour les partenaires les plus générateurs de chiffre d'affaires afin d'aligner la performance commerciale avec la discipline de rétention et la planification de ventes additionnelles.\n`
  markdown += `2. **Segmenter selon la valeur et la maturité.** Utiliser les signaux au niveau des catégories pour distinguer les partenaires de réseau large des comptes stratégiques à fort rendement, puis leur attribuer des cadences, des KPI et des modes d'engagement différents.\n`
  markdown += `3. **Transformer l'activité en pipeline.** Examiner ensemble les offres et les événements afin d'identifier les cas où l'engagement partenaire est élevé mais la monétisation reste faible, en particulier lorsque des leads sont générés sans conversions correspondantes.\n`
  markdown += `4. **Déployer les meilleures pratiques de satisfaction.** Documenter les habitudes opérationnelles des partenariats les mieux notés et les appliquer aux comptes moins performants de la même catégorie.\n`
  markdown += `5. **Suivre l'équilibre du portefeuille chaque mois.** Piloter le nombre de partenaires, le taux d'activité, la concentration du chiffre d'affaires et la satisfaction dans un même tableau de bord de direction afin que la croissance ne se fasse pas au détriment de la qualité relationnelle.\n`

  return {
    title: title || "Rapport d'aperçu du portefeuille partenaires",
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
    specializationRows.slice(0, 3).map((row) => row.specialization ?? "Spécialité non renseignée")
  )

  let markdown = reportPreamble(title || "Rapport des partenariats universitaires", "university-partnerships", generatedAt)
  markdown += "## Résumé exécutif\n\n"
  markdown += `L'écosystème universitaire de Capgemini comprend actuellement **${formatInteger(summary?.totalUniversities)} partenaires académiques**, dont **${formatInteger(summary?.frameworkAgreements)} accords-cadres** déjà formalisés. Ces relations donnent accès à environ **${formatInteger(summary?.totalStudents)} étudiants**, à un potentiel annuel récurrent de **${formatInteger(summary?.totalInternsPerYear)} stages** et à **${formatInteger(summary?.totalHiresPerYear)} recrutements prévus par an** selon les déclarations des partenaires. Le taux moyen de conversion attendu vers le CDI s'établit à **${formatPercent(summary?.avgConversionToCdi)}**, ce qui montre que le canal universitaire n'est pas seulement un levier de marque, mais un véritable vivier de talents.\n\n`
  markdown += `Le jeu de données opérationnel confirme que ce canal est bien actif et non théorique. Les universités les plus suivies cumulent à elles seules **${formatInteger(totalRecruitments)} enregistrements de recrutement** et **${formatInteger(totalCdiConversions)} conversions vers le CDI**, tandis que la satisfaction et la performance moyennes restent suffisamment élevées pour justifier la poursuite des investissements. C'est important, car les partenariats universitaires peuvent vite devenir purement symboliques s'ils ne sont évalués qu'à travers la présence à des événements ou la signature d'accords. Ici, les données de la plateforme montrent un passage concret de l'engagement campus vers des résultats de recrutement.\n\n`
  markdown += `Sur le fond, la demande de recrutement la plus forte se concentre autour de **${dominantSpecialties}**, ce qui donne à l'entreprise un signal très utile sur les alignements campus les plus solides à date. Cela peut orienter la conception des événements, les programmes d'ambassadeurs, la planification des capacités de stage et l'allocation des managers. La présence d'un leader universitaire clairement identifié — actuellement **${leadingUniversity?.partnerName ?? "N/D"}** par contribution suivie au recrutement — fournit également un repère concret pour définir ce qu'un partenariat académique mature doit démontrer en matière de discipline de conversion, de suivi qualité et de retour sur sponsoring.\n\n`

  markdown += "## Indicateurs clés\n\n"
  markdown += markdownTable(
    ["Indicateur", "Valeur"],
    [
      ["Partenaires universitaires", formatInteger(summary?.totalUniversities)],
      ["Accords-cadres", formatInteger(summary?.frameworkAgreements)],
      ["Population étudiante touchée", formatInteger(summary?.totalStudents)],
      ["Capacité de stages par an", formatInteger(summary?.totalInternsPerYear)],
      ["Capacité de recrutements par an", formatInteger(summary?.totalHiresPerYear)],
      ["Taux moyen cible de conversion CDI", formatPercent(summary?.avgConversionToCdi)],
      ["Budget moyen de sponsoring", formatCurrency(summary?.avgSponsorshipBudget)],
      ["Événements moyens par an", formatDecimal(summary?.avgEventsPerYear)],
      ["Recrutements suivis", formatInteger(totalRecruitments)],
      ["Conversions CDI suivies", formatInteger(totalCdiConversions)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Principaux partenaires universitaires\n\n"
  markdown += markdownTable(
    ["Université", "Type d'établissement", "Recrutements", "CDI", "Performance moyenne", "Satisfaction moyenne", "Conversion"],
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
  markdown += `Le tableau des principales universités montre où la maturité du partenariat se traduit déjà en résultats talents mesurables. Les meilleures universités ne sont pas seulement celles qui comptent beaucoup d'étudiants, ce sont celles où Capgemini parvient à faire avancer les candidats dans le parcours, à suivre la performance et à convertir les meilleurs profils en contrats plus durables. Plus l'équilibre entre volume de recrutement, conversion CDI et satisfaction est solide, plus le partenariat est sain. Un volume élevé sans qualité crée une charge de gestion, tandis qu'une qualité élevée sans échelle révèle un potentiel encore sous-exploité.\n\n`

  markdown += "## Tendances de la demande en talents\n\n"
  markdown += markdownTable(
    ["Spécialité", "Recrutements", "CDI", "Performance moyenne"],
    specializationRows.map((row) => [
      row.specialization ?? "Non renseignée",
      formatInteger(row.count),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
    ])
  )
  markdown += "\n\n"
  markdown += markdownTable(
    ["Type de recrutement", "Volume", "CDI", "Satisfaction moyenne"],
    recruitmentTypeRows.map((row) => [
      sentenceCase(row.recruitmentType),
      formatInteger(row.count),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `Ces tendances de demande sont particulièrement utiles pour préparer le prochain cycle académique. Si la plateforme convertit régulièrement les mêmes spécialités et les mêmes types de recrutement, Capgemini devrait formaliser ce signal dans des calendriers partagés avec les universités partenaires, des contenus de marque employeur ciblés et des prévisions de capacité au niveau des managers. À l'inverse, les spécialités à faible conversion ou à performance plus faible peuvent nécessiter des critères de sélection renforcés, une conception de stage revue ou une coordination plus étroite entre les équipes RH et techniques. La valeur de ce rapport n'est donc pas seulement descriptive, il montre aussi où le tunnel académique est aligné et où il fuit encore.\n\n`

  markdown += "## Recommandations\n\n"
  markdown += `1. **Approfondir les meilleurs comptes académiques.** Traiter les universités les plus performantes comme des viviers de talents stratégiques, avec des revues trimestrielles, des plans de recrutement partagés et des signaux de demande de stage plus précoces.\n`
  markdown += `2. **Utiliser les spécialités pour orienter l'animation campus.** Aligner les événements, ateliers et programmes d'ambassadeurs autour des spécialités qui produisent déjà les meilleurs résultats de conversion et de performance.\n`
  markdown += `3. **Étendre la couverture des accords de manière sélective.** Les universités sans accord formel mais présentant une contribution visible au recrutement doivent être priorisées pour des modalités de partenariat structurées.\n`
  markdown += `4. **Suivre la qualité en même temps que le volume.** Conserver la performance, la satisfaction et la conversion CDI sur la même grille de lecture afin que les partenariats académiques soient évalués sur la qualité des talents et pas seulement sur la portée étudiante.\n`
  markdown += `5. **Relier le sponsoring aux résultats.** Comparer les budgets de sponsoring avec les résultats de placement et de conversion afin que l'investissement campus soit concentré là où Capgemini obtient le meilleur retour de recrutement.\n`

  return {
    title: title || "Rapport des partenariats universitaires",
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

  let markdown = reportPreamble(title || "Rapport d'analyse du chiffre d'affaires", "revenue-analysis", generatedAt)
  markdown += "## Résumé exécutif\n\n"
  markdown += `Le portefeuille partenarial actuel enregistre **${formatCurrency(totalRevenue)} de contribution annuelle au chiffre d'affaires** sur l'ensemble des catégories partenaires suivies. Le chiffre d'affaires n'est pas réparti de façon homogène : la catégorie dominante est **${sentenceCase(largestRevenueCategory?.category)}**, et les trois principaux comptes partenaires représentent à eux seuls **${formatPercent(topThreeShare)}** de la base totale de revenus. Ce niveau de concentration est commercialement efficace lorsque ces relations sont saines, mais il crée aussi une exposition si l'attention de la direction, la planification des renouvellements ou le suivi de satisfaction sont moins solides que ne le suggère le profil de revenus.\n\n`
  markdown += `Le moteur de revenus s'appuie aussi sur plusieurs couches de monétisation au-delà des seules déclarations de chiffre d'affaires direct partenaire. La plateforme suit **${formatInteger(offerSummary[0]?.totalOffers)} offres** d'une valeur de **${formatCurrency(offerSummary[0]?.totalOfferValue)}**, des événements partenaires ayant déjà généré **${formatCurrency(eventRevenueSummary[0]?.totalEventRevenue)}** de revenus pour **${formatCurrency(eventRevenueSummary[0]?.totalEventBudget)}** de budget, ainsi que **${formatInteger(vendorProjectSummary[0]?.totalProjects)} projets fournisseurs** représentant **${formatCurrency(vendorProjectSummary[0]?.totalProjectValue)}** de valeur projet. Le portefeuille doit donc être interprété comme un système commercial combiné, associant contribution directe des comptes, monétisation des offres, activation événementielle et économie des projets côté livraison.\n\n`
  markdown += `Du point de vue de la direction, la question centrale n'est pas seulement de savoir où se trouve le revenu aujourd'hui, mais si le pipeline est suffisamment équilibré pour demain. Une croissance saine du chiffre d'affaires exige trois éléments en même temps : une base de comptes majeurs protégée, un milieu de portefeuille de partenaires scalables et un mécanisme opérationnel clair pour transformer l'activité en valeur future. Les données actuelles montrent qu'une couche supérieure solide est déjà en place, mais aussi qu'il faut renforcer la discipline de monétisation sur les événements, les offres et les relations de livraison fournisseur afin de diversifier davantage le modèle de revenus.\n\n`

  markdown += "## Indicateurs clés\n\n"
  markdown += markdownTable(
    ["Indicateur", "Valeur"],
    [
      ["Chiffre d'affaires annuel total des partenaires", formatCurrency(totalRevenue)],
      ["Part du chiffre d'affaires des trois premiers comptes", formatPercent(topThreeShare)],
      ["Offres suivies / actives", `${formatInteger(offerSummary[0]?.totalOffers)} / ${formatInteger(offerSummary[0]?.activeOffers)}`],
      ["Valeur des offres", formatCurrency(offerSummary[0]?.totalOfferValue)],
      ["Nombre d'utilisations des offres", formatInteger(offerSummary[0]?.totalUsage)],
      ["Revenu événementiel", formatCurrency(eventRevenueSummary[0]?.totalEventRevenue)],
      ["Budget événementiel", formatCurrency(eventRevenueSummary[0]?.totalEventBudget)],
      ["ROI moyen des événements", formatDecimal(eventRevenueSummary[0]?.avgRoi, 2)],
      ["Valeur des projets fournisseurs", formatCurrency(vendorProjectSummary[0]?.totalProjectValue)],
      ["Commission fournisseur gagnée", formatCurrency(vendorProjectSummary[0]?.totalCommission)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Chiffre d'affaires par catégorie\n\n"
  markdown += markdownTable(
    ["Catégorie", "Partenaires", "Revenu total", "Revenu moyen", "Satisfaction moyenne"],
    categoryRevenueRows.map((row) => [
      sentenceCase(row.category),
      formatInteger(row.partnerCount),
      formatCurrency(row.totalRevenue),
      formatCurrency(row.avgRevenue),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `Cette vue par catégorie facilite la distinction entre l'échelle et l'efficacité. Les catégories à fort revenu total mais à satisfaction moyenne plus faible peuvent être commercialement importantes tout en restant opérationnellement fragiles. Les catégories aux totaux plus modestes mais à la satisfaction plus forte peuvent représenter des opportunités d'expansion si l'équipe de compte construit davantage d'offres, d'événements ou de projets autour d'elles. La bonne action de pilotage dépend donc de savoir si le problème de la catégorie est la concentration, la sous-penetration ou la qualité relationnelle.\n\n`

  markdown += "## Principaux comptes à fort chiffre d'affaires\n\n"
  markdown += markdownTable(
    ["Partenaire", "Catégorie", "Revenu", "Budget", "Satisfaction"],
    topRevenueRows.map((row) => [
      row.name,
      sentenceCase(row.category),
      formatCurrency(row.revenue),
      formatCurrency(row.budget),
      `${formatInteger(row.satisfaction)} / 100`,
    ])
  )
  markdown += "\n\n"
  markdown += `Les comptes les plus générateurs de revenus doivent être gérés comme une zone de croissance à défendre. Concrètement, cela implique un parrainage exécutif clair, des jalons de renouvellement visibles et une planification volontaire de ventes additionnelles. Les comptes fortement rémunérateurs et très satisfaisants sont les meilleurs candidats pour augmenter la part de portefeuille. À l'inverse, des comptes riches en revenus mais moins satisfaisants constituent un signal d'alerte : les chiffres actuels peuvent encore sembler bons, mais le revenu futur pourrait être exposé si les problèmes opérationnels, les retards de suivi ou la baisse d'engagement restent sans réponse.\n\n`

  markdown += "## Instantané de validation de l'entrepôt de données\n\n"
  markdown += markdownTable(
    ["Partenaire", "Catégorie", "CA DW", "Satisfaction DW"],
    dwTopRevenue.rows.map((row) => [
      String(row.name ?? "N/D"),
      sentenceCase(typeof row.partner_category === "string" ? row.partner_category : null),
      formatCurrency(typeof row.annual_revenue_generated === "number" ? row.annual_revenue_generated : String(row.annual_revenue_generated ?? 0)),
      formatDecimal(typeof row.satisfaction_score === "number" ? row.satisfaction_score : String(row.satisfaction_score ?? 0)),
    ])
  )
  markdown += "\n\n"
  markdown += `L'instantané de l'entrepôt de données sert de signal complémentaire indiquant que les comptes à plus forte valeur sont également visibles dans le modèle BI, ce qui est essentiel pour recouper les hypothèses de pilotage. L'alignement entre la base opérationnelle et le classement revenu du BI renforce la confiance dans le reporting stratégique. Lorsque les mêmes partenaires dominent les deux vues, la direction peut s'appuyer sur eux pour la planification en toute confiance, tandis que toute divergence doit déclencher une revue de la qualité des données ou une analyse plus poussée des décalages temporels entre les mises à jour opérationnelles et les rafraîchissements de l'entrepôt.\n\n`

  markdown += "## Recommandations\n\n"
  markdown += `1. **Réduire le risque de concentration.** Mettre en place des plans trimestriels de rétention et d'expansion pour les principaux comptes générateurs de revenus, en particulier lorsque la satisfaction n'est pas proportionnelle à la contribution commerciale.\n`
  markdown += `2. **Faire monter le milieu de portefeuille.** Identifier les partenaires à revenu intermédiaire disposant d'une forte satisfaction et utiliser les offres, les événements et la planification des comptes pour les faire basculer dans le groupe des comptes les plus commerciaux.\n`
  markdown += `3. **Traiter les événements et les offres comme des canaux de monétisation.** Examiner les activités à faible ROI et réallouer le budget vers les programmes qui génèrent des conversions et des revenus mesurables.\n`
  markdown += `4. **Relier la livraison au reporting de revenus.** Utiliser ensemble la valeur des projets fournisseurs, la commission et la satisfaction pour évaluer quelles relations fournisseurs méritent un investissement stratégique plus profond.\n`
  markdown += `5. **Institutionnaliser les revues de revenus.** Combiner chaque mois les signaux opérationnels et ceux de l'entrepôt afin que le revenu, la satisfaction et la concentration soient pilotés dans une seule conversation de direction.\n`

  return {
    title: title || "Rapport d'analyse du chiffre d'affaires",
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

  let markdown = reportPreamble(title || "Rapport des risques de résiliation", "churn-risk", generatedAt)
  markdown += "## Résumé exécutif\n\n"
  markdown += `La base partenaires compte actuellement **${formatInteger(rankedProfiles.length)} partenaires analysés**, dont **${formatInteger(highRiskCount)} relations à haut risque**, **${formatInteger(mediumRiskCount)} relations à risque moyen** et **${formatInteger(lowRiskCount)} relations à faible risque** selon la récence des interactions, l'évolution de la satisfaction, la volatilité des statuts et la profondeur d'engagement. Le score moyen de risque du portefeuille est de **${formatDecimal(averageRisk)} / 100**, ce qui signifie que l'ensemble de la relation est maîtrisable, mais pas sans risque. Le point le plus urgent n'est pas le nombre de partenaires dans la base, mais le sous-ensemble de relations qui présentent simultanément des signes d'inactivité et d'affaiblissement du sentiment.\n\n`
  markdown += `En pratique, la résiliation ne survient presque jamais à cause d'un seul signal. Elle apparaît généralement lorsque plusieurs indicateurs faibles se cumulent : de longs intervalles depuis le dernier événement ou rendez-vous, une baisse visible de la satisfaction, des changements répétés de statut vers des états suspendus ou incertains, et une faible cadence d'interactions récentes. Les données actuelles reflètent exactement ce schéma dans la partie haute du classement des risques. C'est un bon signal pour le modèle, car il met en évidence des écarts d'animation relationnelle sur lesquels on peut agir, plutôt qu'un simple bruit statistique.\n\n`
  markdown += `Ce rapport doit donc être utilisé comme un outil de pilotage managérial, et pas seulement comme un instantané analytique. Les comptes à haut risque nécessitent une intervention rapide. Les comptes à risque moyen doivent faire l'objet d'une réactivation structurée avant une dégradation supplémentaire. Les comptes à faible risque ne doivent pas être ignorés pour autant, ils représentent la base stable capable d'absorber des initiatives de croissance, des offres pilotes et des collaborations transverses. L'objectif n'est pas seulement d'éviter les résiliations, mais de maintenir un portefeuille équilibré où l'expansion commerciale ne devance pas la santé relationnelle.\n\n`

  markdown += "## Indicateurs clés\n\n"
  markdown += markdownTable(
    ["Indicateur", "Valeur"],
    [
      ["Partenaires analysés", formatInteger(rankedProfiles.length)],
      ["Score moyen de risque", formatDecimal(averageRisk)],
      ["Partenaires à haut risque", formatInteger(highRiskCount)],
      ["Partenaires à risque moyen", formatInteger(mediumRiskCount)],
      ["Partenaires à faible risque", formatInteger(lowRiskCount)],
      ["Partenaire le plus à risque", topRiskPartners[0]?.partnerName ?? "N/D"],
      ["Catégorie la plus à risque", highRiskByCategory[0]?.[0] ?? "N/D"],
    ]
  )
  markdown += "\n\n"

  markdown += "## Partenaires à plus fort risque\n\n"
  markdown += markdownTable(
    ["Partenaire", "Catégorie", "Risque", "Jours depuis la dernière interaction", "Satisfaction", "Baisse", "Avertissements de statut", "Interactions"],
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
  markdown += `Les partenaires de ce tableau requièrent un pilotage actif plutôt qu'une simple surveillance passive. Les comptes à haut risque et aux longues périodes d'inactivité doivent passer immédiatement dans un plan de contact piloté par le responsable business. Les comptes présentant une inactivité modérée mais une forte baisse de satisfaction peuvent nécessiter une remise en qualité de service plutôt qu'une simple relance commerciale. La vraie valeur du classement est d'aider à distinguer la bonne action de rétention, qu'il s'agisse de réactivation, d'escalade, de parrainage exécutif ou de correction opérationnelle.\n\n`

  markdown += "## Concentration du risque élevé par catégorie\n\n"
  markdown += markdownTable(
    ["Catégorie", "Partenaires à risque élevé"],
    highRiskByCategory.map(([category, count]) => [category, formatInteger(count)])
  )
  markdown += "\n\n"
  markdown += `La concentration par catégorie compte, car la résiliation est souvent systémique. Si une catégorie domine la liste des risques élevés, le problème peut être structurel : cadence insuffisante, responsabilité peu claire, faible différenciation du service ou proposition de valeur de catégorie qui ne résonne plus. Si le risque est réparti de manière homogène, le problème est plus probablement lié aux processus sur l'ensemble du portefeuille. Cette vue par catégorie aide donc la direction à choisir entre des interventions ciblées ou une remise à plat plus large de la gouvernance relationnelle.\n\n`

  markdown += "## Recommandations\n\n"
  markdown += `1. **Intervenir sous sept jours pour le groupe le plus risqué.** Désigner les responsables et planifier immédiatement des points de récupération exécutifs ou opérationnels pour les partenaires les plus exposés.\n`
  markdown += `2. **Distinguer l'inactivité de l'insatisfaction.** Utiliser le profil des facteurs de risque pour décider si chaque compte a besoin d'une réactivation, d'une remise en qualité de service ou d'une renégociation commerciale.\n`
  markdown += `3. **Examiner les statuts instables en comité de direction.** Une dégradation répétée du statut doit déclencher une escalade, car elle précède souvent la résiliation avant même que le chiffre d'affaires ne baisse visiblement.\n`
  markdown += `4. **Créer une cadence d'animation pour le risque moyen.** Des points mensuels, des événements plus légers ou des revues d'offres peuvent empêcher les comptes à risque moyen de glisser vers la zone critique.\n`
  markdown += `5. **Intégrer la revue du risque dans la gouvernance du portefeuille.** Le risque doit être examiné en même temps que le revenu et la satisfaction afin que les décisions de compte soient proactives plutôt que réactives.\n`

  return {
    title: title || "Rapport des risques de résiliation",
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

  let markdown = reportPreamble(title || "Rapport de performance du recrutement", "recruitment-performance", generatedAt)
  markdown += "## Résumé exécutif\n\n"
  markdown += `Le vivier de recrutement issu des partenariats universitaires comprend actuellement **${formatInteger(summary?.totalRecruitments)} enregistrements de recrutement suivis**, dont **${formatInteger(summary?.totalCdi)} ont été convertis en CDI**. Cela correspond à un taux de conversion observé de **${formatPercent(conversionRate)}**, soutenu par un score de performance moyen de **${formatDecimal(summary?.avgPerformance)}** et une satisfaction moyenne de **${formatDecimal(summary?.avgSatisfaction)}**. Ce sont des signaux forts montrant que le tunnel de recrutement produit non seulement du volume, mais aussi un niveau significatif de qualité d'embauche et d'expérience candidat.\n\n`
  markdown += `Le niveau d'analyse suivant est opérationnel : quelles universités alimentent les meilleures embauches, quels types de recrutement convertissent le plus efficacement et quelles équipes absorbent la plus grande part des talents entrants ? C'est important, car une performance de recrutement peut sembler positive en agrégé tout en masquant des inefficiences évitables. Par exemple, certains canaux peuvent générer beaucoup de placements mais une conversion CDI plus faible, tandis que d'autres créent moins d'embauches mais un bien meilleur ajustement à long terme. La meilleure stratégie de recrutement est donc celle qui optimise la qualité et la rétention, pas seulement le débit.\n\n`
  markdown += `Le jeu de données crée aussi un pont entre la planification RH et la gestion des partenariats. Comme les universités sources, les équipes affectées, les spécialités et les résultats de conversion sont tous visibles, la plateforme peut dépasser les préférences campus anecdotiques pour aller vers un sourcing des talents fondé sur les preuves. C'est particulièrement utile pour prioriser les futurs événements, les quotas de stage, la préparation des managers et l'allocation budgétaire du vivier académique.\n\n`

  markdown += "## Indicateurs clés\n\n"
  markdown += markdownTable(
    ["Indicateur", "Valeur"],
    [
      ["Recrutements suivis", formatInteger(summary?.totalRecruitments)],
      ["Conversions CDI", formatInteger(summary?.totalCdi)],
      ["Taux observé de conversion CDI", formatPercent(conversionRate)],
      ["Score de performance moyen", formatDecimal(summary?.avgPerformance)],
      ["Score de satisfaction moyen", formatDecimal(summary?.avgSatisfaction)],
      ["Durée moyenne du contrat (mois)", formatDecimal(summary?.avgDuration)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Principales universités d'origine\n\n"
  markdown += markdownTable(
    ["Université", "Recrutements", "CDI", "Performance moyenne", "Satisfaction moyenne"],
    universityRows.map((row) => [
      row.partnerName,
      formatInteger(row.recruitments),
      formatInteger(row.cdiCount),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `La performance d'une université doit être lue comme un mélange d'échelle et d'adéquation. Une bonne université source est celle qui fournit régulièrement des candidats qui performent bien, s'intègrent avec succès dans les équipes et se transforment en recrutements durables à un rythme acceptable. Les universités qui génèrent du volume sans qualité doivent être accompagnées différemment de celles qui produisent un plus petit nombre de placements très réussis. Cette distinction aide les équipes RH à concentrer leur stratégie campus et permet aux responsables partenariats de justifier un engagement académique plus profond là où les résultats sont les meilleurs.\n\n`

  markdown += "## Mix de recrutement\n\n"
  markdown += markdownTable(
    ["Type de recrutement", "Volume", "CDI", "Performance moyenne", "Satisfaction moyenne"],
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
    ["Équipe affectée", "Recrutements", "CDI"],
    teamRows.map((row) => [
      row.assignedTeam ?? "Non affectée",
      formatInteger(row.count),
      formatInteger(row.cdiCount),
    ])
  )
  markdown += "\n\n"
  markdown += `Cette vue du mix montre comment le moteur de recrutement est consommé en interne. Si quelques équipes reçoivent l'essentiel des candidats, elles peuvent avoir besoin d'une capacité d'onboarding plus forte, de structures de mentorat plus lisibles ou de prévisions plus fiables pour préserver l'expérience candidat. Si certains types de recrutement affichent des résultats CDI plus faibles, les RH peuvent vouloir revoir le processus de sélection, le périmètre des missions ou les parcours de transition entre contrat initial et poste permanent. La leçon opérationnelle est que la performance du recrutement dépend à la fois de la qualité du sourcing et de la préparation des équipes réceptrices.\n\n`

  markdown += "## Alignement des compétences\n\n"
  markdown += markdownTable(
    ["Spécialité", "Volume", "Performance moyenne", "Satisfaction moyenne"],
    specializationRows.map((row) => [
      row.specialization ?? "Non renseignée",
      formatInteger(row.count),
      formatDecimal(row.avgPerformance),
      formatDecimal(row.avgSatisfaction),
    ])
  )
  markdown += "\n\n"
  markdown += `Les patterns de spécialisation montrent où l'offre campus et la demande de Capgemini sont les mieux alignées. Les spécialités à fort volume et à forte performance doivent recevoir une programmation campus plus proactive et des prévisions au niveau des managers, car elles représentent déjà des viviers de talents validés. Les spécialités moins performantes peuvent nécessiter un meilleur filtrage, un alignement des rôles revu ou une liste plus resserrée d'écoles partenaires cibles. Cette section est particulièrement utile pour transformer des données de recrutement brutes en stratégie de partenariat académique ciblée.\n\n`

  markdown += "## Recommandations\n\n"
  markdown += `1. **Prioriser les universités qui produisent de la qualité.** Renforcer l'engagement avec les établissements qui combinent fort volume de recrutement, bonne performance et conversion CDI.\n`
  markdown += `2. **Ajuster le mix de recrutement.** Examiner les types de recrutement dont la conversion long terme est plus faible et affiner le parcours du stage ou de l'alternance vers le CDI.\n`
  markdown += `3. **Coordonner plus tôt avec les équipes de recrutement.** Utiliser les patterns d'arrivée au niveau des équipes pour anticiper la demande des managers et éviter les frictions de placement de dernière minute.\n`
  markdown += `4. **Se concentrer sur les viviers de compétences validés.** Diriger les événements campus, la marque employeur et la collaboration académique vers les spécialités qui affichent déjà les meilleurs résultats de performance.\n`
  markdown += `5. **Suivre la performance du recrutement chaque mois.** Conserver la conversion, la satisfaction et la performance dans un même tableau de bord afin que la croissance du volume ne dégrade pas la qualité de l'embauche.\n`

  return {
    title: title || "Rapport de performance du recrutement",
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

  let markdown = reportPreamble(title || "Rapport d'impact des événements", "event-impact", generatedAt)
  markdown += "## Résumé exécutif\n\n"
  markdown += `Les événements partenaires restent l'un des canaux d'activation les plus visibles du portefeuille. La plateforme en recense actuellement **${formatInteger(summary?.totalEvents)}**, réunissant **${formatInteger(summary?.totalParticipants)} participants**, générant **${formatInteger(summary?.totalLeads)} leads** et transformant **${formatInteger(summary?.totalConversions)} de ces leads** en résultats en aval. Sur le plan financier, la couche événementielle représente **${formatCurrency(summary?.totalRevenue)} de revenus liés aux événements** pour **${formatCurrency(summary?.totalBudget)} de dépenses événementielles**, tandis que la satisfaction moyenne des participants s'établit à **${formatDecimal(summary?.avgSatisfaction)} / 100**.\n\n`
  markdown += `Ces résultats montrent que le moteur événementiel ne sert pas seulement la visibilité de la marque. Il contribue de manière mesurable au pipeline et à la valeur commerciale, avec un taux de conversion lead-vers-conversion de **${formatPercent(conversionRate)}** et un ratio revenu-sur-budget de **${formatPercent(revenueToBudget)}**. Cela dit, les programmes événementiels doivent rester pilotés avec rigueur : une forte participation ne signifie pas automatiquement un fort impact business, et des revenus attractifs peuvent masquer une efficacité faible si le ROI varie fortement selon les types d'événements ou les catégories de partenaires.\n\n`
  markdown += `La vraie question pour la direction est donc la suivante : quels formats d'événements créent la meilleure combinaison entre visibilité, pipeline et économie ? Les tableaux ci-dessous y répondent en détaillant l'impact par type d'événement, par catégorie et par événements individuels les plus performants. Cela permet à Capgemini de décider où amplifier, où repenser et où réduire les dépenses si le retour commercial n'est plus convaincant.\n\n`

  markdown += "## Indicateurs clés\n\n"
  markdown += markdownTable(
    ["Indicateur", "Valeur"],
    [
      ["Événements suivis", formatInteger(summary?.totalEvents)],
      ["Participants", formatInteger(summary?.totalParticipants)],
      ["Leads générés", formatInteger(summary?.totalLeads)],
      ["Conversions", formatInteger(summary?.totalConversions)],
      ["Taux lead-vers-conversion", formatPercent(conversionRate)],
      ["Budget événementiel", formatCurrency(summary?.totalBudget)],
      ["Revenus événementiels", formatCurrency(summary?.totalRevenue)],
      ["Ratio revenu-sur-budget", formatPercent(revenueToBudget)],
      ["Satisfaction moyenne des événements", formatDecimal(summary?.avgSatisfaction)],
      ["ROI moyen des événements", formatDecimal(summary?.avgRoi, 2)],
    ]
  )
  markdown += "\n\n"

  markdown += "## Performance des événements par type\n\n"
  markdown += markdownTable(
    ["Type d'événement", "Événements", "Participants", "Leads", "Conversions", "Revenu", "ROI moyen"],
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
  markdown += `Les différents types d'événements créent des formes de valeur différentes. Certains formats sont plus efficaces pour la notoriété et la participation, tandis que d'autres le sont davantage pour la capture de leads ou la génération de revenus. L'implication pratique est que la planification événementielle doit adopter une logique de portefeuille : les événements orientés visibilité peuvent rester justifiés, mais ils ne doivent pas obéir à la même logique budgétaire que les programmes orientés conversion. La meilleure stratégie événementielle est celle qui distingue clairement le branding, la génération de demande, l'activation recrutement et le maintien relationnel.\n\n`

  markdown += "## Événements les plus performants\n\n"
  markdown += markdownTable(
    ["Événement", "Partenaire", "Type", "Date", "Leads", "Conversions", "Revenu", "ROI", "Satisfaction"],
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
  markdown += `Les événements les plus performants doivent être traités comme des modèles opérationnels reproductibles et non comme des succès isolés. Si un petit nombre d'événements combine de manière répétée forte conversion, revenu élevé et bonne satisfaction des participants, ils doivent devenir des références pour la planification future. Les facteurs sous-jacents peuvent inclure l'adéquation partenaire, la clarté de la cible, la qualité du contenu ou un meilleur suivi post-événement. Reproduire ces mécanismes vaut généralement plus que simplement augmenter le nombre total d'événements.\n\n`

  markdown += "## Contribution des événements par catégorie de partenaire\n\n"
  markdown += markdownTable(
    ["Catégorie", "Événements", "Revenu", "Leads", "Conversions"],
    categoryRows.map((row) => [
      sentenceCase(row.category),
      formatInteger(row.eventCount),
      formatCurrency(row.revenue),
      formatInteger(row.leads),
      formatInteger(row.conversions),
    ])
  )
  markdown += "\n\n"
  markdown += `La contribution événementielle au niveau des catégories montre si le moteur événementiel est équilibré ou trop dépendant d'un seul segment partenaire. Si une catégorie domine les revenus tandis qu'une autre domine la participation, Capgemini doit décider volontairement si ce mix reflète une stratégie ou simplement une habitude historique. Cette distinction aide les responsables budgétaires à choisir où amplifier les formats éprouvés et où repenser les modèles d'événements visibles mais commercialement faibles.\n\n`

  markdown += "## Recommandations\n\n"
  markdown += `1. **Renforcer les formats à fort retour.** Reproduire les structures d'événements qui combinent déjà revenus, conversions et forte satisfaction des participants.\n`
  markdown += `2. **Séparer les KPI de notoriété des KPI commerciaux.** Éviter d'évaluer les événements de marque et les événements générateurs de revenus avec les mêmes critères de succès.\n`
  markdown += `3. **Resserrer le suivi post-événement.** Les événements qui génèrent beaucoup de leads mais convertissent moins ont besoin d'une meilleure transmission vers les workflows compte, RH ou campagne.\n`
  markdown += `4. **Revoir l'allocation par catégorie.** Comparer les dépenses et les résultats des événements par catégorie partenaire pour s'assurer que les ressources sont alignées avec les objectifs stratégiques, et pas seulement avec l'historique des calendriers.\n`
  markdown += `5. **Institutionnaliser les revues de ROI événementiel.** Ajouter des points de contrôle mensuels sur la performance événementielle afin que les futurs budgets soient guidés par les preuves plutôt que par la seule présence.\n`

  return {
    title: title || "Rapport d'impact des événements",
    markdown,
    topic: "event-impact",
    generatedAt: generatedAt.toISOString(),
  }
}
