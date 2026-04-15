"use client"

import * as React from "react"
import Link from "next/link"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  FileAttachmentIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/frontend/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card"
import { toast } from "@/frontend/components/ui/toast"
import { cn } from "@/frontend/lib/utils"

interface ReportPreviewProps {
  title: string
  markdown: string
  topic: string
  generatedAt: string
}

const PREVIEW_STORAGE_KEY = "intelliconnect-report-markdown"

function encodeMarkdown(markdown: string) {
  if (typeof window === "undefined") {
    return ""
  }

  const bytes = new TextEncoder().encode(markdown)
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return window.btoa(binary)
}

const previewComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn("text-lg font-semibold text-foreground", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn("mt-4 text-base font-semibold text-foreground", className)} {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("leading-7 text-sm text-muted-foreground [&:not(:first-child)]:mt-3", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("ml-5 list-disc space-y-1 text-sm text-muted-foreground", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("ml-5 list-decimal space-y-1 text-sm text-muted-foreground", className)} {...props} />
  ),
  table: ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
      <table className={cn("w-full border-collapse text-left text-xs", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn("border-b border-border bg-blue-600/10 px-3 py-2 font-semibold text-foreground", className)} {...props} />
  ),
  td: ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("border-b border-border px-3 py-2 text-muted-foreground", className)} {...props} />
  ),
}

export function ReportPreview({ title, markdown, topic, generatedAt }: ReportPreviewProps) {
  const previewText = React.useMemo(() => markdown.slice(0, 320).trim(), [markdown])
  const encodedMarkdown = React.useMemo(() => encodeMarkdown(markdown), [markdown])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      toast.success("Markdown copied", {
        description: "The report markdown is ready to paste anywhere.",
      })
    } catch (error) {
      const description = error instanceof Error ? error.message : "Unable to copy the markdown."
      toast.error("Copy failed", { description })
    }
  }, [markdown])

  const handlePersist = React.useCallback(() => {
    try {
      window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, encodeMarkdown(markdown))
    } catch (error) {
      console.error("Failed to persist report markdown", error)
    }
  }, [markdown])

  return (
    <Card className="border-border/70 bg-card/95 shadow-sm">
      <CardHeader className="gap-3 border-b border-border/70 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <HugeiconsIcon icon={FileAttachmentIcon} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
            <CardDescription>
              {topic.replaceAll("-", " ")} • {new Date(generatedAt).toLocaleDateString("en-US")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="max-h-64 overflow-hidden rounded-xl border border-border bg-background/80 p-4">
          <Markdown components={previewComponents} remarkPlugins={[remarkGfm]}>
            {previewText}
          </Markdown>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Open the full report for editing, printing, or PDF export.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => void handleCopy()} className="cursor-pointer">
              <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
              Copy Markdown
            </Button>

            <Button asChild className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
              <Link
                href={encodedMarkdown ? `/dashboard/reports?content=${encodeURIComponent(encodedMarkdown)}` : "/dashboard/reports"}
                onClick={handlePersist}
              >
                <HugeiconsIcon icon={ViewIcon} className="mr-2 h-4 w-4" />
                View Full Report
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
