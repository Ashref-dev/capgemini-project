/**
 * Centralized French humanization helpers for user-facing enum and status values.
 *
 * Code and comments are in English; every returned label is in French
 * (per the IntelliConnect language rule). Each formatter is a small, pure
 * function that maps a raw database value to a proper French label and falls
 * back to a prettified version of unknown values instead of leaking raw
 * enum strings such as `forum_emploi`, `students`, or `termine` to users.
 */

const EMPTY_PLACEHOLDER = "—"

/**
 * Prettify an unknown raw value: replace separators with spaces, collapse
 * whitespace, and capitalize the first letter. Used as a safe fallback so the
 * UI never shows a bare snake_case enum even for values missing from a map.
 */
function prettify(value: string): string {
  const cleaned = value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")

  if (!cleaned) {
    return EMPTY_PLACEHOLDER
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/**
 * Resolve a raw value against a label map using a normalized (lowercased,
 * trimmed) key, falling back to the prettified raw value when unknown and to a
 * placeholder when empty.
 */
function fromMap(value: string | null | undefined, map: Record<string, string>): string {
  if (value == null) {
    return EMPTY_PLACEHOLDER
  }

  const raw = value.trim()
  if (!raw) {
    return EMPTY_PLACEHOLDER
  }

  return map[raw.toLowerCase()] ?? prettify(raw)
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  forum_emploi: "Forum emploi",
  workshop: "Atelier",
  webinar: "Webinaire",
  hackathon: "Hackathon",
  conference: "Conférence",
  seminaire: "Séminaire",
  meetup: "Rencontre",
  formation: "Formation",
  table_ronde: "Table ronde",
  networking: "Réseautage",
}

/** Humanize a partner event type (free-form varchar in the database). */
export function formatEventType(value: string | null | undefined): string {
  return fromMap(value, EVENT_TYPE_LABELS)
}

const EVENT_STATUS_LABELS: Record<string, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
  reporte: "Reporté",
}

/** Humanize a partner event status. */
export function formatEventStatus(value: string | null | undefined): string {
  return fromMap(value, EVENT_STATUS_LABELS)
}

const OFFER_AUDIENCE_LABELS: Record<string, string> = {
  students: "Étudiants",
  employees: "Employés",
  employes: "Employés",
  companies: "Entreprises",
  startups: "Startups",
  partners: "Partenaires",
  public: "Grand public",
  all: "Tous",
}

/** Humanize an offer target audience (free-form varchar in the database). */
export function formatOfferAudience(value: string | null | undefined): string {
  return fromMap(value, OFFER_AUDIENCE_LABELS)
}

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  percentage: "Pourcentage",
  fixed: "Montant fixe",
}

/** Humanize an offer discount type. */
export function formatDiscountType(value: string | null | undefined): string {
  return fromMap(value, DISCOUNT_TYPE_LABELS)
}

/**
 * Render an offer discount as a value plus its type, e.g. `20 %` or `150 TND`.
 * Falls back to the type label alone when no numeric value is available, so the
 * UI never shows a bare `%`.
 */
export function formatDiscountValue(
  discountType: string | null | undefined,
  rawValue: string | number | null | undefined,
): string {
  const numeric =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string" && rawValue.trim() !== ""
        ? Number(rawValue)
        : null

  const hasValue = numeric != null && Number.isFinite(numeric) && numeric > 0

  // total_value_tnd is always a TND amount (no raw percentage is stored), so it
  // must never be rendered with a "%" suffix even for percentage-type offers.
  if (hasValue) {
    return `${numeric.toLocaleString("fr-FR")} TND`
  }

  return formatDiscountType(discountType)
}

const PARTNER_STATUS_LABELS: Record<string, string> = {
  actif: "Actif",
  inactif: "Inactif",
  en_negociation: "En négociation",
  termine: "Terminé",
  prospect: "Prospect",
  suspendu: "Suspendu",
}

/** Humanize a partner / partnership status. */
export function formatPartnerStatus(value: string | null | undefined): string {
  return fromMap(value, PARTNER_STATUS_LABELS)
}

const PARTNER_CATEGORY_LABELS: Record<string, string> = {
  customer: "Client",
  marketing: "Marketing",
  supplier: "Fournisseur",
  university: "Université",
}

/** Humanize a partner category. */
export function formatPartnerCategory(value: string | null | undefined): string {
  return fromMap(value, PARTNER_CATEGORY_LABELS)
}

const PARTNERSHIP_LEVEL_LABELS: Record<string, string> = {
  standard: "Standard",
  strategique: "Stratégique",
  strategic: "Stratégique",
  exclusif: "Exclusif",
  exclusive: "Exclusif",
  platinum: "Platine",
  platine: "Platine",
  gold: "Or",
  or: "Or",
  silver: "Argent",
  argent: "Argent",
  bronze: "Bronze",
}

/** Humanize a partnership level (free-form varchar, mixed casing). */
export function formatPartnershipLevel(value: string | null | undefined): string {
  return fromMap(value, PARTNERSHIP_LEVEL_LABELS)
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  planned: "Planifié",
  active: "Actif",
  on_hold: "En pause",
  done: "Terminé",
  cancelled: "Annulé",
}

/** Humanize a project status. */
export function formatProjectStatus(value: string | null | undefined): string {
  return fromMap(value, PROJECT_STATUS_LABELS)
}

const PROJECT_HEALTH_LABELS: Record<string, string> = {
  R: "À risque",
  Y: "Attention",
  G: "Sain",
}

/** Humanize a project health flag (single-letter R/Y/G, case-sensitive). */
export function formatProjectHealth(value: string | null | undefined): string {
  if (value == null) {
    return EMPTY_PLACEHOLDER
  }

  const raw = value.trim()
  if (!raw) {
    return EMPTY_PLACEHOLDER
  }

  return PROJECT_HEALTH_LABELS[raw.toUpperCase()] ?? prettify(raw)
}

const RECRUITMENT_TYPE_LABELS: Record<string, string> = {
  stage: "Stage",
  alternance: "Alternance",
  vie: "VIE",
  cdi_jeune_diplome: "CDI jeune diplômé",
  contrat_pro: "Contrat pro",
}

/** Humanize a student recruitment type. */
export function formatRecruitmentType(value: string | null | undefined): string {
  return fromMap(value, RECRUITMENT_TYPE_LABELS)
}

const RECRUITMENT_STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Refusée",
}

/** Humanize a partnership request / recruitment review status. */
export function formatRecruitmentStatus(value: string | null | undefined): string {
  return fromMap(value, RECRUITMENT_STATUS_LABELS)
}
