"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileAttachmentIcon,
  Upload04Icon,
  Download04Icon,
  Delete02Icon,
  ArrowLeft01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { AddButton } from "@/frontend/components/ui/add-button"
import { FileCard, extToFormat } from "@/frontend/components/ui/file-card"
import { useAuth } from "@/frontend/hooks/use-auth"
import Link from "next/link"

interface Document {
  id: number
  partnerId: number
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  filePath: string
  description: string | null
  uploadedBy: string
  uploadedByType: string
  uploadedById: number | null
  createdAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " o"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko"
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo"
}

function getExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "code"
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

export default function PartnerDocumentsPage() {
  const params = useParams()
  const { user } = useAuth()
  const partnerId = params.id as string

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [partnerName, setPartnerName] = useState("")
  const [search, setSearch] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents?partnerId=${partnerId}`)
      const data = await res.json()
      if (res.ok) setDocuments(data.documents || [])
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les documents" })
    } finally {
      setLoading(false)
    }
  }, [partnerId])

  const fetchPartnerName = useCallback(async () => {
    try {
      const res = await fetch(`/api/partners?search=&category=&status=&level=`)
      const data = await res.json()
      if (res.ok) {
        const partner = data.partners?.find((p: { id: number }) => p.id === Number(partnerId))
        if (partner) setPartnerName(partner.name)
      }
    } catch {}
  }, [partnerId])

  useEffect(() => {
    fetchDocuments()
    fetchPartnerName()
  }, [fetchDocuments, fetchPartnerName])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) { toast.error("Veuillez selectionner un fichier"); return }
    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("partnerId", partnerId)
    if (description.trim()) formData.append("description", description.trim())
    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok) {
        toast.success("Document ajoute", { description: selectedFile.name + " uploade avec succes." })
        setSelectedFile(null); setDescription(""); setShowUpload(false)
        fetchDocuments()
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible d'uploader le document" })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm("Supprimer " + doc.originalName + " ?")) return
    try {
      const res = await fetch(`/api/documents?id=${doc.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Document supprime")
        fetchDocuments()
      } else {
        const data = await res.json()
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur de connexion")
    }
  }

  const handleDownload = (doc: Document) => {
    window.open(`/api/documents/download?id=${doc.id}`, "_blank")
  }

  const isAdmin = user?.role === "admin" || user?.role === "manager"

  const filtered = documents.filter((d) =>
    d.originalName.toLowerCase().includes(search.toLowerCase()) ||
    (d.description || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard/partners">
            <Button variant="ghost" size="sm" className="shrink-0">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <HugeiconsIcon icon={FileAttachmentIcon} className="w-6 h-6 text-primary" />
              Documents{partnerName ? " — " + partnerName : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <AddButton
          onClick={() => setShowUpload(!showUpload)}
          label="Ajouter un document"
          className="shrink-0"
        />
      </motion.div>

      {/* Upload form */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
              <h3 className="font-semibold mb-4 text-foreground">Uploader un document</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Fichier *</Label>
                    <Input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.rtf,.png,.jpg,.jpeg,.gif,.zip,.rar"
                      required
                    />
                    <p className="text-xs text-muted-foreground">PDF, Word, Excel, CSV, PowerPoint, Images, Archives — max 50 Mo</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Description</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description du document (optionnel)"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {uploading ? "Upload en cours..." : "Uploader"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowUpload(false); setSelectedFile(null); setDescription("") }}>
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      {documents.length > 0 && (
        <div className="relative max-w-sm">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document..."
            className="pl-9"
          />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <HugeiconsIcon icon={FileAttachmentIcon} className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-medium">Aucun document</p>
          <p className="text-xs mt-1">Aucun document associe a ce partenaire pour le moment.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Aucun resultat pour « {search} »</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((doc) => {
            const format = extToFormat(getExt(doc.originalName))
            return (
              <motion.div key={doc.id} variants={item}>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      <FileCard formatFile={format} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate" title={doc.originalName}>
                        {doc.originalName}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span>Taille</span>
                      <span className="font-medium text-foreground">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploade par</span>
                      <span className="font-medium text-foreground truncate max-w-[120px]">
                        {doc.uploadedByType === "employee" ? "Employe" : "Partenaire"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-medium text-foreground">
                        {new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-blue-600 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950"
                      onClick={() => handleDownload(doc)}
                    >
                      <HugeiconsIcon icon={Download04Icon} className="w-4 h-4 mr-2" />
                      Telecharger
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDelete(doc)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
