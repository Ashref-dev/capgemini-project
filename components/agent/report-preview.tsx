"use client"

import * as React from "react"
import Link from "next/link"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Download04Icon, FileAttachmentIcon, ViewIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { cn, isInternalDashboardHref } from "@/lib/utils"

interface ReportPreviewProps {
  title: string
  markdown: string
  topic: string
  generatedAt: string
}

// Literal hex required: html2canvas cannot resolve CSS vars / oklch() in the
// off-screen print node. Single source of truth for the exported PDF's brand.
const BRAND_PRINT = {
  primary: "#0070AD",
  primaryDark: "#005a8e",
} as const

const PREVIEW_STORAGE_KEY = "intelliconnect-report-markdown"

function encodeMarkdown(markdown: string) {
  if (typeof window === "undefined") return ""
  const bytes = new TextEncoder().encode(markdown)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return window.btoa(binary)
}

const previewComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn("text-base font-semibold text-foreground", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("mt-3 text-sm font-semibold text-foreground", className)} {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-xs leading-6 text-muted-foreground [&:not(:first-child)]:mt-2", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("ml-4 list-disc space-y-0.5 text-xs text-muted-foreground", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("ml-4 list-decimal space-y-0.5 text-xs text-muted-foreground", className)} {...props} />
  ),
  a: ({ className, href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const linkClassName = cn("text-primary underline underline-offset-2 hover:text-primary/80", className)

    if (typeof href !== "string" || href.length === 0) {
      return <span className={linkClassName}>{children}</span>
    }

    if (isInternalDashboardHref(href)) {
      return (
        <Link href={href} className={linkClassName}>
          {children}
        </Link>
      )
    }

    return (
      <a className={linkClassName} href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    )
  },
  table: ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="mt-3 overflow-x-auto rounded-lg border border-border">
      <table className={cn("w-full border-collapse text-left text-xs", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn("border-b border-border bg-primary/10 px-2.5 py-1.5 font-semibold text-foreground", className)} {...props} />
  ),
  td: ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("border-b border-border px-2.5 py-1.5 text-muted-foreground", className)} {...props} />
  ),
}

export function ReportPreview({ title, markdown, topic, generatedAt }: ReportPreviewProps) {
  const previewText = React.useMemo(() => markdown.slice(0, 400).trim(), [markdown])
  const encodedMarkdown = React.useMemo(() => encodeMarkdown(markdown), [markdown])
  const [isExporting, setIsExporting] = React.useState(false)
  const printRef = React.useRef<HTMLDivElement>(null)

  const handleCopy = React.useCallback(() => {
    void navigator.clipboard.writeText(markdown).then(
      () => toast.success("Markdown copié", { description: "Le rapport est dans le presse-papiers." }),
      () => toast.error("Copie impossible"),
    )
  }, [markdown])

  const handlePersist = React.useCallback(() => {
    try {
      window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, encodeMarkdown(markdown))
    } catch {}
  }, [markdown])

  const handleDownloadPdf = React.useCallback(async () => {
    if (!printRef.current) return
    setIsExporting(true)
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60) || "rapport"
    try {
      // html2canvas-pro understands the app's oklch() theme tokens (classic
      // html2canvas does not and silently stalls); jsPDF paginates the canvas.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ])
      const node = printRef.current
      const render = async () => {
        const canvas = await html2canvas(node, {
          scale: 2,
          backgroundColor: "#ffffff",
          windowWidth: 800,
          logging: false,
          useCORS: true,
        })
        const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
        const margin = 10
        const usableWidth = pdf.internal.pageSize.getWidth() - margin * 2
        const usableHeight = pdf.internal.pageSize.getHeight() - margin * 2
        const imageHeight = (canvas.height * usableWidth) / canvas.width
        const imageData = canvas.toDataURL("image/jpeg", 0.95)
        pdf.addImage(imageData, "JPEG", margin, margin, usableWidth, imageHeight)
        let heightRemaining = imageHeight - usableHeight
        while (heightRemaining > 0) {
          pdf.addPage()
          pdf.addImage(imageData, "JPEG", margin, margin - (imageHeight - heightRemaining), usableWidth, imageHeight)
          heightRemaining -= usableHeight
        }
        pdf.save(`${slug}.pdf`)
      }
      const guard = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("pdf-timeout")), 45000),
      )
      await Promise.race([render(), guard])
      toast.success("PDF téléchargé", { description: `${slug}.pdf enregistré.` })
    } catch {
      toast.error("Export PDF échoué", { description: "Réessayez depuis la page Rapports." })
    } finally {
      setIsExporting(false)
    }
  }, [title])

  return (
    <>
      <div
        ref={printRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-10000px",
          left: "-10000px",
          width: "800px",
          backgroundColor: "#ffffff",
          padding: "48px 56px",
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "#0f172a",
          lineHeight: 1.75,
        }}
      >
        <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: `2px solid ${BRAND_PRINT.primary}` }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 3,
              color: BRAND_PRINT.primary,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Capgemini Tunisia — IntelliConnect AI
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {topic.replaceAll("-", " ")} ·{" "}
            {new Date(generatedAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...p }) => <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "24px 0 12px" }} {...p} />,
            h2: ({ ...p }) => (
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "20px 0 10px", paddingBottom: 6, borderBottom: "1px solid #e2e8f0" }} {...p} />
            ),
            h3: ({ ...p }) => <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: "16px 0 8px" }} {...p} />,
            p: ({ ...p }) => <p style={{ fontSize: 14, color: "#334155", margin: "10px 0" }} {...p} />,
            ul: ({ ...p }) => <ul style={{ paddingLeft: 20, margin: "8px 0" }} {...p} />,
            ol: ({ ...p }) => <ol style={{ paddingLeft: 20, margin: "8px 0" }} {...p} />,
            li: ({ ...p }) => <li style={{ fontSize: 13, color: "#334155", marginBottom: 4 }} {...p} />,
            strong: ({ ...p }) => <strong style={{ fontWeight: 700, color: "#0f172a" }} {...p} />,
            blockquote: ({ ...p }) => (
              <blockquote
                style={{ borderLeft: `3px solid ${BRAND_PRINT.primary}`, paddingLeft: 12, color: "#475569", margin: "12px 0", fontStyle: "italic" }}
                {...p}
              />
            ),
            table: ({ ...p }) => (
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} {...p} />
              </div>
            ),
            thead: ({ ...p }) => <thead style={{ backgroundColor: BRAND_PRINT.primary }} {...p} />,
            th: ({ ...p }) => (
              <th style={{ padding: "8px 12px", color: "white", fontWeight: 600, textAlign: "left", border: `1px solid ${BRAND_PRINT.primaryDark}` }} {...p} />
            ),
            td: ({ ...p }) => (
              <td style={{ padding: "8px 12px", border: "1px solid #e2e8f0", color: "#334155", verticalAlign: "top" }} {...p} />
            ),
          }}
        >
          {markdown}
        </Markdown>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="gap-2 border-b border-border px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={FileAttachmentIcon} className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-1 text-sm">{title}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {topic.replaceAll("-", " ")} · {new Date(generatedAt).toLocaleDateString("fr-FR")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-4 pb-4 pt-3">
          <div className="max-h-44 overflow-hidden rounded-lg border border-border bg-muted/20 p-3">
            <Markdown components={previewComponents} remarkPlugins={[remarkGfm]}>
              {previewText}
            </Markdown>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="h-8 gap-1.5 px-2.5 text-xs">
              <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
              Copier
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isExporting}
              onClick={() => void handleDownloadPdf()}
              className="h-8 gap-1.5 bg-primary px-2.5 text-xs text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {isExporting ? <Spinner size="sm" /> : <HugeiconsIcon icon={Download04Icon} className="h-3.5 w-3.5" />}
              {isExporting ? "Export…" : "Télécharger PDF"}
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="ml-auto h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link
                href={
                  encodedMarkdown
                    ? `/dashboard/reports?content=${encodeURIComponent(encodedMarkdown)}`
                    : "/dashboard/reports"
                }
                onClick={handlePersist}
              >
                <HugeiconsIcon icon={ViewIcon} className="h-3.5 w-3.5" />
                Rapport complet
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
