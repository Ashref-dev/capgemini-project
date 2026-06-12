"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  FileAttachmentIcon,
  Delete02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type ProjectDoc = {
  id: number
  projectId: number
  fileName: string
  originalName: string
  fileType: string | null
  fileSize: number | null
  filePath: string
  description: string | null
  uploadedBy: string | null
  createdAt: string
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileGlyph(mime: string | null): string {
  if (!mime) return "📄"
  if (mime.includes("pdf")) return "📕"
  if (mime.includes("word") || mime.includes("doc")) return "📘"
  if (mime.includes("sheet") || mime.includes("excel")) return "📗"
  if (mime.startsWith("image/")) return "🖼️"
  if (mime.includes("markdown") || mime === "text/plain") return "📝"
  return "📄"
}

interface DocumentsTabProps {
  projectId: number
  isAdmin: boolean
  onChange?: () => void
}

export function DocumentsTab({ projectId, isAdmin, onChange }: DocumentsTabProps) {
  const [docs, setDocs] = React.useState<ProjectDoc[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [dragOver, setDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const fetchAll = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/documents`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur de chargement")
      setDocs(data.documents ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  React.useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (list.length === 0) return
    setUploading(true)
    setProgress(0)
    try {
      for (let i = 0; i < list.length; i++) {
        const file = list[i]!
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch(`/api/projects/${projectId}/documents`, {
          method: "POST",
          body: fd,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error(`Échec du téléversement de ${file.name}`, { description: data.error })
          continue
        }
        setProgress(((i + 1) / list.length) * 100)
      }
      toast.success("Téléversement terminé")
      void fetchAll()
      onChange?.()
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce document ?")) return
    try {
      const res = await fetch(`/api/projects/${projectId}/documents?documentId=${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? "Erreur de suppression")
      }
      toast.success("Document supprimé")
      void fetchAll()
      onChange?.()
    } catch (e) {
      toast.error("Erreur", { description: (e as Error).message })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Documents du projet</h3>
          <p className="text-xs text-muted-foreground">
            {docs.length} document{docs.length > 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => e.target.files && void upload(e.target.files)}
            />
            <Button
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
              Téléverser
            </Button>
          </>
        )}
      </div>

      {isAdmin && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            void upload(e.dataTransfer.files)
          }}
          className={cn(
            "block w-full cursor-pointer rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            dragOver
              ? "border-primary/60 bg-primary/5"
              : "border-border/60 bg-muted/30 hover:bg-muted/50",
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Téléversement…</p>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                  className="h-full rounded-full bg-blue-500"
                />
              </div>
            </div>
          ) : (
            <>
              <HugeiconsIcon icon={FileAttachmentIcon} className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                Glissez vos fichiers ici, ou cliquez sur &laquo; Téléverser &raquo;
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, XLS, MD, TXT, PNG, JPG · max 25 MB</p>
            </>
          )}
        </button>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["d1", "d2", "d3"].map((k) => (
            <div key={k} className="h-24 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 px-6 py-10 text-center">
          <HugeiconsIcon icon={FileAttachmentIcon} className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Aucun document</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {docs.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i, 6) * 0.03 }}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                  {fileGlyph(d.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={`/api/documents/download?id=${d.id}&source=project`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {d.originalName ?? d.fileName}
                  </a>
                  <p className="text-[11px] text-muted-foreground">
                    {formatBytes(d.fileSize)} · {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  {d.uploadedBy && (
                    <p className="truncate text-[10px] text-muted-foreground/80">par {d.uploadedBy}</p>
                  )}
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    aria-label="Supprimer"
                    onClick={() => void handleDelete(d.id)}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/40"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
