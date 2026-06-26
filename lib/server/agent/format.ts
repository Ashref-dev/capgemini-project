export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function normalizeAmount(value: string | number | null | undefined) {
  if (value == null) {
    return 0
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function daysSince(value: Date | string | null | undefined) {
  const date = normalizeDate(value)
  if (!date) {
    return null
  }

  const diffMs = Date.now() - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export function formatCurrency(value: string | number | null | undefined) {
  return `${Math.round(normalizeAmount(value)).toLocaleString("en-US")} TND`
}

export function formatPercent(value: string | number | null | undefined, fractionDigits = 1) {
  return `${normalizeAmount(value).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`
}

export function formatDecimal(value: string | number | null | undefined, fractionDigits = 1) {
  return normalizeAmount(value).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatInteger(value: string | number | null | undefined) {
  return Math.round(normalizeAmount(value)).toLocaleString("en-US")
}

export function formatReportDate(value: Date | string | null | undefined) {
  const date = normalizeDate(value)

  if (!date) {
    return "N/D"
  }

  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function sentenceCase(value: string | null | undefined) {
  if (!value) {
    return "Inconnu"
  }

  const topicLabels: Record<string, string> = {
    "partner-overview": "Aperçu du portefeuille partenaires",
    "university-partnerships": "Partenariats universitaires",
    "revenue-analysis": "Analyse du chiffre d'affaires",
    "churn-risk": "Risque de résiliation",
    "recruitment-performance": "Performance du recrutement",
    "event-impact": "Impact des événements",
  }

  const topicLabel = topicLabels[value]
  if (topicLabel) {
    return topicLabel
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function markdownTable(headers: string[], rows: string[][]) {
  const safeRows = rows.length > 0 ? rows : [["Aucune donnée disponible", ...headers.slice(1).map(() => "—")]]
  const headerRow = `| ${headers.join(" | ")} |`
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`
  const bodyRows = safeRows.map((row) => `| ${row.join(" | ")} |`).join("\n")

  return `${headerRow}\n${separatorRow}\n${bodyRows}`
}

export function reportPreamble(title: string, topic: string, generatedAt: Date) {
  return [
    `# ${title}`,
    "",
    `**Généré le** : ${formatReportDate(generatedAt)}`,
    "**Analyste** : IntelliConnect IA",
    `**Sujet** : ${sentenceCase(topic)}`,
    "",
  ].join("\n")
}

export function toWordList(values: Array<string | null | undefined>) {
  const filtered = values.filter((value): value is string => typeof value === "string" && value.trim().length > 0)

  if (filtered.length === 0) {
    return "aucun élément dominant"
  }

  if (filtered.length === 1) {
    return filtered[0]
  }

  if (filtered.length === 2) {
    return `${filtered[0]} et ${filtered[1]}`
  }

  return `${filtered.slice(0, -1).join(", ")}, et ${filtered[filtered.length - 1]}`
}

export type ReportPayload = {
  title: string
  markdown: string
  topic: string
  generatedAt: string
}
