export type PartnershipRequestRecommendation = "APPROVE" | "REVIEW" | "REJECT"

export interface PartnershipRequestScoringInput {
  companyName?: string | null
  legalName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactRole?: string | null
  website?: string | null
  description?: string | null
  country?: string | null
  address?: string | null
  numEmployees?: number | null
  annualRevenue?: string | null
  category?: string | null
  partnerSubcategory?: string | null
  partnershipLevel?: string | null
  motivations?: string | null
  universityData?: Record<string, unknown> | null
  technologyData?: Record<string, unknown> | null
}

export interface PartnershipRequestScoreBreakdown {
  dataCompleteness: number
  strategicFit: number
  reliability: number
  scalePotential: number
  categoryBoost: number
}

export interface PartnershipRequestAnalysis {
  compatibilityScore: number
  confidence: number
  recommendation: PartnershipRequestRecommendation
  summary: string
  reasons: string[]
  riskFlags: string[]
  breakdown: PartnershipRequestScoreBreakdown
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeText(value?: string | null) {
  return value?.trim() || ""
}

function isCorporateEmail(email?: string | null) {
  const normalized = normalizeText(email).toLowerCase()
  if (!normalized.includes("@")) return false
  return !/(gmail|hotmail|outlook|yahoo)\./.test(normalized)
}

function hasHttpsWebsite(website?: string | null) {
  return normalizeText(website).toLowerCase().startsWith("https://")
}

function parseTechnologies(value?: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : []
}

function toRoundedScore(value: number, max: number) {
  return clamp(Math.round(value), 0, max)
}

export function analyzePartnershipRequest(input: PartnershipRequestScoringInput): PartnershipRequestAnalysis {
  const category = normalizeText(input.category)
  const reasons: string[] = []
  const riskFlags: string[] = []

  const optionalFields = [
    input.legalName,
    input.contactPhone,
    input.contactRole,
    input.website,
    input.description,
    input.country,
    input.address,
    input.partnerSubcategory,
    input.partnershipLevel,
    input.motivations,
    input.annualRevenue,
  ]

  if (typeof input.numEmployees === "number" && input.numEmployees > 0) {
    optionalFields.push(String(input.numEmployees))
  }

  const categorySpecificFields: unknown[] = []
  if (category === "university") {
    categorySpecificFields.push(
      input.universityData?.institutionType,
      input.universityData?.numStudents,
      input.universityData?.specialties,
      input.universityData?.numInternsPerYear,
      input.universityData?.numHiresPerYear,
    )
  }
  if (category === "supplier") {
    categorySpecificFields.push(
      input.technologyData?.vendorType,
      input.technologyData?.technologies,
      input.technologyData?.certificationsHeld,
      input.technologyData?.certificationLevel,
      input.technologyData?.partnershipModel,
    )
  }

  const availableOptionalCount = [
    ...optionalFields.filter((value) => normalizeText(typeof value === "string" ? value : value ? String(value) : "").length > 0),
    ...categorySpecificFields.filter((value) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === "number") return value > 0
      return normalizeText(typeof value === "string" ? value : value ? String(value) : "").length > 0
    }),
  ].length

  const optionalTarget = optionalFields.length + categorySpecificFields.length || 1
  const dataCompleteness = toRoundedScore((availableOptionalCount / optionalTarget) * 30, 30)

  let strategicFit = 8
  if (input.motivations && normalizeText(input.motivations).length >= 60) {
    strategicFit += 5
    reasons.push("Motivation détaillée fournie")
  } else if (!input.motivations) {
    riskFlags.push("Motivations peu détaillées")
  }
  if (input.partnerSubcategory) strategicFit += 4
  if (input.partnershipLevel) strategicFit += 3
  if (category === "customer") {
    strategicFit += 8
    if ((input.numEmployees || 0) >= 200) {
      strategicFit += 2
      reasons.push("Entreprise avec capacité opérationnelle significative")
    }
  }
  if (category === "supplier") {
    const technologies = parseTechnologies(input.technologyData?.technologies)
    strategicFit += technologies.length >= 2 ? 9 : 5
    if (technologies.length >= 2) reasons.push(`Stack technologique déclarée: ${technologies.slice(0, 3).join(", ")}`)
  }
  if (category === "university") {
    strategicFit += input.universityData?.numInternsPerYear ? 8 : 5
    if (input.universityData?.numInternsPerYear) reasons.push("Potentiel stage/recrutement identifié")
  }
  if (category === "marketing") strategicFit += 7
  strategicFit = toRoundedScore(strategicFit, 30)

  let reliability = 4
  if (isCorporateEmail(input.contactEmail)) {
    reliability += 6
    reasons.push("Email professionnel détecté")
  } else {
    riskFlags.push("Email de contact générique ou personnel")
  }
  if (hasHttpsWebsite(input.website)) {
    reliability += 4
    reasons.push("Site web professionnel renseigné")
  } else if (!input.website) {
    riskFlags.push("Site web absent")
  }
  if (input.contactPhone) reliability += 2
  if (input.legalName) reliability += 2
  if (input.contactRole) reliability += 2
  if (input.country && input.address) reliability += 2
  if (!input.contactPhone) riskFlags.push("Téléphone de contact manquant")
  reliability = toRoundedScore(reliability, 20)

  let scalePotential = 2
  if ((input.numEmployees || 0) >= 500) {
    scalePotential += 8
    reasons.push("Taille d'entreprise compatible avec un partenariat structuré")
  } else if ((input.numEmployees || 0) >= 100) {
    scalePotential += 5
  } else if ((input.numEmployees || 0) > 0) {
    scalePotential += 2
  }

  if (category === "university") {
    const students = Number(input.universityData?.numStudents || 0)
    const interns = Number(input.universityData?.numInternsPerYear || 0)
    if (students >= 2000) scalePotential += 6
    else if (students >= 500) scalePotential += 4
    if (interns >= 50) scalePotential += 3
  }

  if (category === "supplier") {
    const technologies = parseTechnologies(input.technologyData?.technologies)
    const certifications = Number(input.technologyData?.certificationsHeld || 0)
    if (technologies.length >= 3) scalePotential += 4
    else if (technologies.length >= 1) scalePotential += 2
    if (certifications >= 5) scalePotential += 3
  }

  if (normalizeText(input.description).length >= 100) scalePotential += 2
  scalePotential = toRoundedScore(scalePotential, 15)

  let categoryBoost = 2
  if (category === "customer" || category === "supplier") categoryBoost = 5
  else if (category === "university" || category === "marketing") categoryBoost = 4

  const breakdown: PartnershipRequestScoreBreakdown = {
    dataCompleteness,
    strategicFit,
    reliability,
    scalePotential,
    categoryBoost,
  }

  const compatibilityScore = clamp(
    breakdown.dataCompleteness + breakdown.strategicFit + breakdown.reliability + breakdown.scalePotential + breakdown.categoryBoost,
    0,
    100,
  )

  let recommendation: PartnershipRequestRecommendation = "REVIEW"
  if (compatibilityScore >= 75) recommendation = "APPROVE"
  else if (compatibilityScore < 55) recommendation = "REJECT"

  const confidence = clamp(Math.round(45 + breakdown.dataCompleteness + breakdown.reliability / 2), 45, 95)

  if (compatibilityScore >= 75) {
    reasons.unshift("Dossier globalement solide pour une revue rapide")
  } else if (compatibilityScore < 55) {
    riskFlags.unshift("Dossier incomplet ou peu qualifié")
  } else {
    riskFlags.unshift("Une validation humaine reste nécessaire")
  }

  const categoryLabel = {
    customer: "client",
    marketing: "marketing",
    supplier: "fournisseur technologique",
    university: "universitaire",
  }[category] || "partenaire"

  const summary = compatibilityScore >= 75
    ? `Profil ${categoryLabel} prometteur avec un dossier suffisamment qualifié pour prioriser l'examen.`
    : compatibilityScore >= 55
      ? `Profil ${categoryLabel} intéressant mais nécessitant une revue manuelle avant décision.`
      : `Profil ${categoryLabel} actuellement trop faible ou incomplet pour une validation rapide.`

  return {
    compatibilityScore,
    confidence,
    recommendation,
    summary,
    reasons: Array.from(new Set(reasons)).slice(0, 5),
    riskFlags: Array.from(new Set(riskFlags)).slice(0, 5),
    breakdown,
  }
}