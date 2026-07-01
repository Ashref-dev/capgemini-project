import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isInternalDashboardHref(href: string | undefined): boolean {
  if (typeof href !== "string" || href.length === 0) {
    return false
  }

  return href.startsWith("/dashboard/")
}

// True only for real destinations. The agent wraps document/report citations
// in pseudo-hrefs (e.g. "partner_document#11-chunk-0") that must render as text.
export function isNavigableHref(href: string | undefined): href is string {
  if (typeof href !== "string" || href.length === 0) {
    return false
  }

  return (
    href.startsWith("/") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  )
}

// The markdown hardening plugin replaces links with non-allowlisted hrefs by a
// "[blocked]" span. The agent legitimately emits pseudo-href citations
// (e.g. "[Contrat](partner_document#11-chunk-0)"), so we unwrap those links to
// their label text before rendering, leaving real navigable links intact.
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^()\s]+)(?:\s+"[^"]*")?\)/g

export function stripNonNavigableLinks(markdown: string): string {
  if (typeof markdown !== "string" || markdown.length === 0) {
    return markdown
  }

  return markdown.replace(MARKDOWN_LINK_PATTERN, (match, label: string, href: string) =>
    isNavigableHref(href) ? match : label,
  )
}

// The agent emits raw RAG citation tokens like "[partner_document#29-chunk-0]"
// that map to no route, so they render as literal bracket noise. Sources are
// already surfaced as real deep links in the final "## Sources" section, so we
// drop these inline tokens (and any leftover space before them) before display.
const INLINE_DOCUMENT_CITATION_PATTERN =
  / ?\[(?:partner_document|project_document)#\d+-chunk-\d+\]/g

export function stripInlineDocumentCitations(markdown: string): string {
  if (typeof markdown !== "string" || markdown.length === 0) {
    return markdown
  }

  return markdown.replace(INLINE_DOCUMENT_CITATION_PATTERN, "")
}
