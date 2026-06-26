"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Copy01Icon,
  Download04Icon,
  Edit02Icon,
  FileAttachmentIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { cn, isInternalDashboardHref } from "@/lib/utils"

const REPORT_STORAGE_KEY = "intelliconnect-report-markdown"

function encodeBase64Utf8(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return window.btoa(binary)
}

function decodeMarkdown(value: string) {
  try {
    const bytes = Uint8Array.from(window.atob(value), (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

function deriveTitle(markdown: string) {
  const firstHeading = markdown
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "))

  return firstHeading?.replace(/^#\s+/, "").trim() || "Rapport généré"
}

const markdownComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn("mb-6 text-4xl font-semibold tracking-tight text-slate-950", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("mt-10 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-950", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("mt-8 text-xl font-semibold text-slate-900", className)} {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("mt-4 text-[17px] leading-8 text-slate-700", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("mt-4 ml-6 list-disc space-y-2 text-[17px] leading-8 text-slate-700", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("mt-4 ml-6 list-decimal space-y-2 text-[17px] leading-8 text-slate-700", className)} {...props} />
  ),
  a: ({ className, href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const linkClassName = cn("font-medium text-primary underline underline-offset-2 hover:text-primary/80", className)

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
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-semibold text-slate-950", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className={cn("mt-6 border-l-4 border-primary/60 bg-primary/5 px-5 py-4 italic text-slate-700", className)} {...props} />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className={cn("rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-900", className)} {...props} />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className={cn("mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-5 text-sm text-slate-50", className)} {...props} />
  ),
  table: ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn("bg-primary text-white", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn("border border-primary/80 px-4 py-3 font-semibold", className)} {...props} />
  ),
  tbody: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={cn("[&_tr:nth-child(even)]:bg-slate-50", className)} {...props} />
  ),
  td: ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("border border-slate-300 px-4 py-3 align-top text-slate-700", className)} {...props} />
  ),
}

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const printRef = React.useRef<HTMLDivElement>(null)
  const [markdown, setMarkdown] = React.useState("")
  const [mode, setMode] = React.useState<"preview" | "edit">("preview")
  const [isExporting, setIsExporting] = React.useState(false)

  React.useEffect(() => {
    const encodedContent = searchParams.get("content")

    if (encodedContent) {
      const decoded = decodeMarkdown(encodedContent)

      if (decoded) {
        setMarkdown(decoded)
        window.sessionStorage.setItem(REPORT_STORAGE_KEY, encodeBase64Utf8(decoded))
        return
      }
    }

    const storedEncodedMarkdown = window.sessionStorage.getItem(REPORT_STORAGE_KEY)
    if (storedEncodedMarkdown) {
      const decoded = decodeMarkdown(storedEncodedMarkdown)
      if (decoded) {
        setMarkdown(decoded)
      }
    }
  }, [searchParams])

  React.useEffect(() => {
    if (!markdown) {
      return
    }

    window.sessionStorage.setItem(REPORT_STORAGE_KEY, encodeBase64Utf8(markdown))
  }, [markdown])

  const title = React.useMemo(() => deriveTitle(markdown), [markdown])

  const handleCopy = React.useCallback(async () => {
    if (!markdown.trim()) {
      toast.info("Aucun contenu à copier.")
      return
    }

    try {
      await navigator.clipboard.writeText(markdown)
      toast.success("Markdown copié", {
        description: "Le markdown brut du rapport est dans votre presse-papiers.",
      })
    } catch (error) {
      const description = error instanceof Error ? error.message : "Impossible de copier le markdown."
      toast.error("Copie échouée", { description })
    }
  }, [markdown])

  const handleExportPdf = React.useCallback(async () => {
    if (!printRef.current || !markdown.trim()) {
      toast.info("Aucun contenu à exporter.")
      return
    }

    setIsExporting(true)

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "rapport"

    try {
      // html2canvas-pro resolves the app's oklch() theme tokens that classic
      // html2canvas stalls on; jsPDF paginates the rendered canvas onto A4.
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

      toast.success("PDF téléchargé", {
        description: "Votre rapport a été exporté en PDF.",
      })
    } catch (error) {
      const description = error instanceof Error ? error.message : "Impossible d'exporter le rapport en PDF."
      toast.error("Export PDF échoué", { description })
    } finally {
      setIsExporting(false)
    }
  }, [markdown, title])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mx-auto max-w-6xl space-y-6"
      >
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HugeiconsIcon icon={FileAttachmentIcon} className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Visionneur de rapports</h1>
                <p className="text-sm text-muted-foreground">
                  Prévisualisez, modifiez, copiez et exportez vos rapports générés par l&apos;IA.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
              <Button asChild variant="ghost" className="cursor-pointer text-muted-foreground hover:text-foreground">
                <Link href="/dashboard/agent">
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
                  Retour à l&apos;agent
                </Link>
              </Button>

              <Button type="button" variant="outline" onClick={() => void handleCopy()} className="cursor-pointer">
                <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
                Copier Markdown
              </Button>

              <Button
                type="button"
                onClick={() => void handleExportPdf()}
                disabled={isExporting || !markdown.trim()}
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <HugeiconsIcon icon={Download04Icon} className="mr-2 h-4 w-4" />
                {isExporting ? "Export…" : "Exporter PDF"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">
                  Rendu sur canvas blanc optimisé pour l&apos;export PDF A4.
                </p>
              </div>

              <Tabs value={mode} onValueChange={(value) => setMode(value as "preview" | "edit")} className="w-full lg:w-auto">
                <TabsList className="grid w-full grid-cols-2 border border-border bg-muted/60 lg:w-[240px]">
                  <TabsTrigger value="preview" className="cursor-pointer text-xs font-medium">
                    <HugeiconsIcon icon={ViewIcon} className="mr-2 h-4 w-4" />
                    Aperçu
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="cursor-pointer text-xs font-medium">
                    <HugeiconsIcon icon={Edit02Icon} className="mr-2 h-4 w-4" />
                    Modifier
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {mode === "edit" ? (
              <Textarea
                value={markdown}
                onChange={(event) => setMarkdown(event.target.value)}
                placeholder="Collez ou modifiez le contenu markdown du rapport ici…"
                className="min-h-[70vh] resize-y border-border bg-white font-mono text-sm leading-7 text-slate-900"
                aria-label="Éditeur markdown du rapport"
              />
            ) : null}

            {mode === "preview" ? (
              markdown.trim() ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div ref={printRef} className="mx-auto w-full max-w-[800px] bg-white px-6 py-10 md:px-12 md:py-14 print:px-8 print:py-10">
                    <article className="font-serif text-slate-900">
                      <Markdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                        {markdown}
                      </Markdown>
                    </article>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HugeiconsIcon icon={FileAttachmentIcon} className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Aucun rapport chargé</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Générez un rapport depuis l&apos;agent IA — le bouton <strong>« Rapport complet »</strong> ou <strong>« Télécharger PDF »</strong> dans la carte rapport ouvrira cette page avec le contenu. Vous pouvez aussi coller du markdown en mode Modifier.
                  </p>
                  <Button asChild className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/dashboard/agent">
                      Aller à l&apos;agent IA
                    </Link>
                  </Button>
                </div>
              )
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
