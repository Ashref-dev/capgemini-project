"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileAttachmentIcon,
  Upload04Icon,
  Download04Icon,
  Delete02Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
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
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || ""
  if (["pdf"].includes(ext)) return "📄"
  if (["doc", "docx"].includes(ext)) return "📝"
  if (["xls", "xlsx", "csv"].includes(ext)) return "📊"
  if (["ppt", "pptx"].includes(ext)) return "📑"
  if (["png", "jpg", "jpeg", "gif"].includes(ext)) return "🖼️"
  if (["zip", "rar"].includes(ext)) return "📦"
  return "📎"
}

export default function PartnerDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const partnerId = params.id as string

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [partnerName, setPartnerName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents?partnerId=${partnerId}`)
      const data = await res.json()
      if (res.ok) {
        setDocuments(data.documents || [])
      }
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
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("partnerId", partnerId)
    if (description.trim()) formData.append("description", description.trim())

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Document ajouté", { description: `${selectedFile.name} a été uploadé avec succès.` })
        setSelectedFile(null)
        setDescription("")
        setShowUpload(false)
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
    if (!confirm(`Supprimer "${doc.originalName}" ?`)) return
    try {
      const res = await fetch(`/api/documents?id=${doc.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Document supprimé")
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/partners">
            <Button variant="ghost" size="sm">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={FileAttachmentIcon} className="w-6 h-6 text-primary" />
              Documents {partnerName && `— ${partnerName}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {documents.length} document{documents.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <HugeiconsIcon icon={Upload04Icon} className="w-4 h-4 mr-2" />
          Ajouter un document
        </Button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border rounded-xl p-6 bg-card"
        >
          <h3 className="font-semibold mb-4">Uploader un document</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Fichier *</Label>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.rtf,.png,.jpg,.jpeg,.gif,.zip,.rar"
                required
              />
              <p className="text-xs text-muted-foreground">
                Formats acceptés : PDF, Word, Excel, CSV, PowerPoint, Images, Archives (max 50 Mo)
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du document (optionnel)"
              />
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
        </motion.div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HugeiconsIcon icon={FileAttachmentIcon} className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun document trouvé pour ce partenaire</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Document</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Taille</th>
                <th className="text-left px-4 py-3 font-medium">Uploadé par</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFileIcon(doc.originalName)}</span>
                      <div>
                        <div className="font-medium">{doc.originalName}</div>
                        <div className="text-xs text-muted-foreground">{doc.fileType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {doc.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatFileSize(doc.fileSize)}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{doc.uploadedBy}</div>
                    <div className="text-xs text-muted-foreground">
                      {doc.uploadedByType === "employee" ? "Employé" : "Partenaire"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(doc.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleDownload(doc)}
                      >
                        <HugeiconsIcon icon={Download04Icon} className="w-4 h-4 mr-1" />
                        Télécharger
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(doc)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
