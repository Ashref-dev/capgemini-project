"use client"

import * as React from "react"
import { Streamdown } from "streamdown"
import "streamdown/styles.css"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon, Alert02Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { extToFormat } from "@/components/ui/file-card"

type PreviewKind = "markdown" | "pdf" | "image" | "unsupported"
type FetchStatus = "loading" | "ready" | "error"

export interface PreviewDocument {
  id: number
  originalName: string
  fileType: string
}

interface DocumentPreviewDialogProps {
  document: PreviewDocument | null
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (document: PreviewDocument) => void
}

function getExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? ""
}

function resolvePreviewKind(fileType: string, originalName: string): PreviewKind {
  const mime = fileType.toLowerCase()
  const ext = getExtension(originalName)
  const format = extToFormat(ext)

  if (
    mime === "text/markdown" ||
    ext === "md" ||
    ext === "mdx" ||
    ext === "markdown" ||
    format === "md" ||
    format === "mdx"
  ) {
    return "markdown"
  }

  if (mime === "application/pdf" || ext === "pdf" || format === "pdf") {
    return "pdf"
  }

  if (
    mime.startsWith("image/") ||
    format === "img" ||
    format === "png" ||
    format === "jpg" ||
    format === "jpeg"
  ) {
    return "image"
  }

  return "unsupported"
}

export function DocumentPreviewDialog({
  document,
  description,
  open,
  onOpenChange,
  onDownload,
}: DocumentPreviewDialogProps) {
  const [status, setStatus] = React.useState<FetchStatus>("loading")
  const [markdown, setMarkdown] = React.useState("")

  const kind = document
    ? resolvePreviewKind(document.fileType, document.originalName)
    : "unsupported"
  const inlineUrl = document
    ? `/api/documents/download?id=${document.id}&disposition=inline`
    : ""
  const documentId = document?.id ?? null

  React.useEffect(() => {
    if (!open || documentId === null || kind !== "markdown") {
      return
    }

    const controller = new AbortController()
    setStatus("loading")
    setMarkdown("")

    fetch(inlineUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("preview_fetch_failed")
        }
        return res.text()
      })
      .then((text) => {
        setMarkdown(text)
        setStatus("ready")
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }
        setStatus("error")
      })

    return () => controller.abort()
  }, [open, documentId, kind, inlineUrl])

  const handleDownload = React.useCallback(() => {
    if (document) {
      onDownload(document)
    }
  }, [document, onDownload])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4 pr-12 text-left">
          <DialogTitle className="truncate" title={document?.originalName}>
            {document?.originalName ?? "Aperçu du document"}
          </DialogTitle>
          <DialogDescription className={description ? "truncate" : "sr-only"}>
            {description || "Aperçu du contenu du document"}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {kind === "markdown" && status === "loading" && (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          )}

          {kind === "markdown" && status === "error" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <HugeiconsIcon icon={Alert02Icon} className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Impossible de charger l&apos;aperçu
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Une erreur est survenue lors du chargement du document. Vous pouvez le télécharger pour le consulter.
              </p>
            </div>
          )}

          {kind === "markdown" && status === "ready" && (
            <div className="text-sm leading-6 text-foreground">
              <Streamdown linkSafety={{ enabled: false }}>{markdown}</Streamdown>
            </div>
          )}

          {kind === "pdf" && (
            <iframe
              src={inlineUrl}
              title={`Aperçu de ${document?.originalName ?? "document"}`}
              className="h-[70vh] w-full rounded-lg border border-border bg-muted"
            />
          )}

          {kind === "image" && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inlineUrl}
                alt={document?.originalName ?? "Aperçu du document"}
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            </div>
          )}

          {kind === "unsupported" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <HugeiconsIcon icon={Alert02Icon} className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Aperçu indisponible pour ce format
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Ce type de fichier ne peut pas être prévisualisé. Téléchargez-le pour le consulter.
              </p>
              <Button size="sm" onClick={handleDownload}>
                <HugeiconsIcon icon={Download04Icon} className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border px-5 py-3">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <HugeiconsIcon icon={Download04Icon} className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentPreviewDialog
