"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileAttachmentIcon,
  Upload04Icon,
  Download04Icon,
  Delete02Icon,
  ArrowLeft01Icon,
  Calendar03Icon,
  Mail01Icon,
  CallIcon,
  CheckmarkSquare01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Textarea } from "@/frontend/components/ui/textarea"
import { Badge } from "@/frontend/components/ui/badge"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs"
import { useAuth } from "@/frontend/hooks/use-auth"
import Link from "next/link"

// ─── Types ──────────────────────────────────────────────

interface Document {
  id: number; partnerId: number; fileName: string; originalName: string; fileType: string
  fileSize: number; filePath: string; description: string | null; uploadedBy: string
  uploadedByType: string; createdAt: string
}

interface Meeting {
  id: number; partnerId: number; title: string; meetingDate: string; durationMinutes: number
  employeeName: string; employeeRole: string | null; location: string | null
  meetingType: string; agenda: string | null; conclusions: string | null
  remarks: string | null; agreements: string | null; sharedDocuments: string | null
  satisfactionScore: number | null; nextSteps: string | null; createdAt: string
}

interface Notification {
  id: number; partnerId: number; type: string; title: string; message: string
  emailSent: boolean; emailSubject: string | null; isRead: boolean
  sentBy: string | null; createdAt: string
}

// ─── Helpers ────────────────────────────────────────────

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
  return "📎"
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

const meetingTypeLabels: Record<string, string> = {
  presentiel: "Présentiel",
  visioconference: "Visioconférence",
  telephonique: "Téléphonique",
}

const notifTypeColors: Record<string, string> = {
  email: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  system: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  meeting: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  document: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  status_change: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  general: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
}

// ─── Main Component ─────────────────────────────────────

export default function PartnerCommunicationsPage() {
  const params = useParams()
  const { user } = useAuth()
  const partnerId = params.id as string

  const [activeTab, setActiveTab] = useState("meetings")
  const [partnerName, setPartnerName] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  // Meeting form
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [meetingForm, setMeetingForm] = useState({
    title: "", meetingDate: "", durationMinutes: "60", location: "", meetingType: "presentiel",
    agenda: "", conclusions: "", remarks: "", agreements: "", sharedDocuments: "",
    satisfactionScore: "", nextSteps: "",
  })
  const [savingMeeting, setSavingMeeting] = useState(false)

  // Upload form
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadDesc, setUploadDesc] = useState("")
  const [uploading, setUploading] = useState(false)

  // Notification form
  const [showNotifForm, setShowNotifForm] = useState(false)
  const [notifForm, setNotifForm] = useState({
    type: "email", title: "", message: "", emailSubject: "",
  })
  const [savingNotif, setSavingNotif] = useState(false)

  // Expanded meeting
  const [expandedMeeting, setExpandedMeeting] = useState<number | null>(null)

  const isAdmin = user?.role === "admin" || user?.role === "manager"

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [docsRes, meetRes, notifRes, partnersRes] = await Promise.all([
        fetch(`/api/documents?partnerId=${partnerId}`),
        fetch(`/api/meetings?partnerId=${partnerId}`),
        fetch(`/api/notifications?partnerId=${partnerId}`),
        fetch(`/api/partners?search=`),
      ])
      const [docsData, meetData, notifData, partnersData] = await Promise.all([
        docsRes.json(), meetRes.json(), notifRes.json(), partnersRes.json(),
      ])
      setDocuments(docsData.documents || [])
      setMeetings(meetData.meetings || [])
      setNotifications(notifData.notifications || [])
      const p = partnersData.partners?.find((p: { id: number }) => p.id === Number(partnerId))
      if (p) setPartnerName(p.name)
    } catch {
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [partnerId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ─── Handlers ───────────────────────────────────────

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return toast.error("Sélectionnez un fichier")
    setUploading(true)
    const fd = new FormData()
    fd.append("file", selectedFile)
    fd.append("partnerId", partnerId)
    if (uploadDesc.trim()) fd.append("description", uploadDesc.trim())
    try {
      const res = await fetch("/api/documents", { method: "POST", body: fd })
      if (res.ok) {
        toast.success("Document ajouté")
        setSelectedFile(null); setUploadDesc(""); setShowUpload(false); fetchAll()
      } else {
        const d = await res.json(); toast.error(d.error)
      }
    } catch { toast.error("Erreur upload") }
    finally { setUploading(false) }
  }

  const handleDeleteDoc = async (id: number, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" })
      if (res.ok) { toast.success("Document supprimé"); fetchAll() }
    } catch { toast.error("Erreur") }
  }

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetingForm.title || !meetingForm.meetingDate) return toast.error("Titre et date requis")
    setSavingMeeting(true)
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...meetingForm, partnerId, durationMinutes: Number(meetingForm.durationMinutes), satisfactionScore: meetingForm.satisfactionScore ? Number(meetingForm.satisfactionScore) : null }),
      })
      if (res.ok) {
        toast.success("Réunion enregistrée")
        setMeetingForm({ title: "", meetingDate: "", durationMinutes: "60", location: "", meetingType: "presentiel", agenda: "", conclusions: "", remarks: "", agreements: "", sharedDocuments: "", satisfactionScore: "", nextSteps: "" })
        setShowMeetingForm(false); fetchAll()
      } else {
        const d = await res.json(); toast.error(d.error)
      }
    } catch { toast.error("Erreur") }
    finally { setSavingMeeting(false) }
  }

  const handleCreateNotif = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notifForm.title || !notifForm.message) return toast.error("Titre et message requis")
    setSavingNotif(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...notifForm, partnerId }),
      })
      const data = await res.json()
      if (res.ok) {
        const emailMsg = data.emailSent ? " (email envoyé)" : " (email non envoyé, notification sauvegardée)"
        toast.success(`Notification créée${emailMsg}`)
        setNotifForm({ type: "email", title: "", message: "", emailSubject: "" })
        setShowNotifForm(false); fetchAll()
      } else {
        toast.error(data.error)
      }
    } catch { toast.error("Erreur") }
    finally { setSavingNotif(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>

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
            <h1 className="text-2xl font-bold">Communications & Interactions</h1>
            {partnerName && <p className="text-sm text-muted-foreground mt-1">{partnerName}</p>}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-2xl font-bold text-primary">{meetings.length}</div>
          <div className="text-sm text-muted-foreground">Réunions</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-2xl font-bold text-green-600">{documents.length}</div>
          <div className="text-sm text-muted-foreground">Documents</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
          <div className="text-sm text-muted-foreground">Notifications</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 border border-border">
          <TabsTrigger value="meetings" className="text-xs font-medium">Réunions ({meetings.length})</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs font-medium">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs font-medium">Notifications ({notifications.length})</TabsTrigger>
        </TabsList>

        {/* ─── MEETINGS TAB ─── */}
        <TabsContent value="meetings" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowMeetingForm(!showMeetingForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
              Nouvelle réunion
            </Button>
          </div>

          {showMeetingForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl p-6 bg-card space-y-4">
              <h3 className="font-semibold">Enregistrer une réunion</h3>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Titre *</Label>
                    <Input value={meetingForm.title} onChange={(e) => setMeetingForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Date et heure *</Label>
                    <Input type="datetime-local" value={meetingForm.meetingDate} onChange={(e) => setMeetingForm(f => ({ ...f, meetingDate: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Durée (minutes)</Label>
                    <Input type="number" value={meetingForm.durationMinutes} onChange={(e) => setMeetingForm(f => ({ ...f, durationMinutes: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Type</Label>
                    <select value={meetingForm.meetingType} onChange={(e) => setMeetingForm(f => ({ ...f, meetingType: e.target.value }))}
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                      <option value="presentiel">Présentiel</option>
                      <option value="visioconference">Visioconférence</option>
                      <option value="telephonique">Téléphonique</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Lieu</Label>
                    <Input value={meetingForm.location} onChange={(e) => setMeetingForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Score satisfaction (1-10)</Label>
                    <Input type="number" min="1" max="10" value={meetingForm.satisfactionScore} onChange={(e) => setMeetingForm(f => ({ ...f, satisfactionScore: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ordre du jour</Label>
                  <Textarea value={meetingForm.agenda} onChange={(e) => setMeetingForm(f => ({ ...f, agenda: e.target.value }))} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Conclusions</Label>
                  <Textarea value={meetingForm.conclusions} onChange={(e) => setMeetingForm(f => ({ ...f, conclusions: e.target.value }))} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Remarques</Label>
                  <Textarea value={meetingForm.remarks} onChange={(e) => setMeetingForm(f => ({ ...f, remarks: e.target.value }))} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Accords conclus</Label>
                  <Textarea value={meetingForm.agreements} onChange={(e) => setMeetingForm(f => ({ ...f, agreements: e.target.value }))} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Documents partagés</Label>
                  <Input value={meetingForm.sharedDocuments} onChange={(e) => setMeetingForm(f => ({ ...f, sharedDocuments: e.target.value }))} placeholder="Nom des documents échangés" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Prochaines étapes</Label>
                  <Textarea value={meetingForm.nextSteps} onChange={(e) => setMeetingForm(f => ({ ...f, nextSteps: e.target.value }))} rows={2} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={savingMeeting} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />
                    {savingMeeting ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowMeetingForm(false)}>Annuler</Button>
                </div>
              </form>
            </motion.div>
          )}

          {meetings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HugeiconsIcon icon={Calendar03Icon} className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune réunion enregistrée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border border-border rounded-xl bg-card overflow-hidden">
                  <button
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedMeeting(expandedMeeting === m.id ? null : m.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <HugeiconsIcon icon={m.meetingType === "visioconference" ? CallIcon : Calendar03Icon} className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{m.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{formatDateTime(m.meetingDate)}</span>
                          <span>•</span>
                          <span>{m.durationMinutes} min</span>
                          <span>•</span>
                          <span>{meetingTypeLabels[m.meetingType] || m.meetingType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.satisfactionScore && (
                        <Badge variant="secondary" className="text-xs">{m.satisfactionScore}/10</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{m.employeeName}</span>
                    </div>
                  </button>
                  {expandedMeeting === m.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}
                      className="border-t border-border p-4 space-y-3 bg-muted/10">
                      {m.location && <div><span className="text-xs font-semibold text-muted-foreground">Lieu :</span> <span className="text-sm">{m.location}</span></div>}
                      {m.agenda && <div><span className="text-xs font-semibold text-muted-foreground">Ordre du jour :</span><p className="text-sm mt-1">{m.agenda}</p></div>}
                      {m.conclusions && <div><span className="text-xs font-semibold text-muted-foreground">Conclusions :</span><p className="text-sm mt-1">{m.conclusions}</p></div>}
                      {m.remarks && <div><span className="text-xs font-semibold text-muted-foreground">Remarques :</span><p className="text-sm mt-1">{m.remarks}</p></div>}
                      {m.agreements && <div><span className="text-xs font-semibold text-muted-foreground">Accords :</span><p className="text-sm mt-1 p-2 rounded bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300">{m.agreements}</p></div>}
                      {m.sharedDocuments && <div><span className="text-xs font-semibold text-muted-foreground">Documents partagés :</span><p className="text-sm mt-1">{m.sharedDocuments}</p></div>}
                      {m.nextSteps && <div><span className="text-xs font-semibold text-muted-foreground">Prochaines étapes :</span><p className="text-sm mt-1 p-2 rounded bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300">{m.nextSteps}</p></div>}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── DOCUMENTS TAB ─── */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowUpload(!showUpload)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <HugeiconsIcon icon={Upload04Icon} className="w-4 h-4 mr-2" />
              Ajouter un document
            </Button>
          </div>

          {showUpload && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl p-6 bg-card">
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Fichier *</Label>
                  <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.rtf,.png,.jpg,.jpeg,.gif,.zip,.rar" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Description</Label>
                  <Input value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="Description (optionnel)" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {uploading ? "Upload..." : "Uploader"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowUpload(false)}>Annuler</Button>
                </div>
              </form>
            </motion.div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HugeiconsIcon icon={FileAttachmentIcon} className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun document</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Document</th>
                    <th className="text-left px-4 py-3 font-medium">Description</th>
                    <th className="text-left px-4 py-3 font-medium">Taille</th>
                    <th className="text-left px-4 py-3 font-medium">Par</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(doc.originalName)}</span>
                          <span className="font-medium">{doc.originalName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{doc.description || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-4 py-3 text-xs">{doc.uploadedBy}
                        <div className="text-muted-foreground">{doc.uploadedByType === "employee" ? "Employé" : "Partenaire"}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(doc.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => window.open(`/api/documents/download?id=${doc.id}`, "_blank")}>
                            <HugeiconsIcon icon={Download04Icon} className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteDoc(doc.id, doc.originalName)}>
                              <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ─── NOTIFICATIONS TAB ─── */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowNotifForm(!showNotifForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-2" />
              Envoyer une notification
            </Button>
          </div>

          {showNotifForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl p-6 bg-card space-y-4">
              <h3 className="font-semibold">Nouvelle notification</h3>
              <form onSubmit={handleCreateNotif} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Type</Label>
                    <select value={notifForm.type} onChange={(e) => setNotifForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                      <option value="email">Email</option>
                      <option value="general">Général</option>
                      <option value="meeting">Réunion</option>
                      <option value="document">Document</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Sujet email (si type email)</Label>
                    <Input value={notifForm.emailSubject} onChange={(e) => setNotifForm(f => ({ ...f, emailSubject: e.target.value }))} placeholder="Sujet de l'email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Titre *</Label>
                  <Input value={notifForm.title} onChange={(e) => setNotifForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Message *</Label>
                  <Textarea value={notifForm.message} onChange={(e) => setNotifForm(f => ({ ...f, message: e.target.value }))} rows={4} required />
                </div>
                <p className="text-xs text-muted-foreground">
                  Si un sujet email est renseigné, le système tentera d&apos;envoyer un email. En cas d&apos;échec, la notification sera quand même sauvegardée.
                </p>
                <div className="flex gap-2">
                  <Button type="submit" disabled={savingNotif} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {savingNotif ? "Envoi..." : "Envoyer"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowNotifForm(false)}>Annuler</Button>
                </div>
              </form>
            </motion.div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HugeiconsIcon icon={Mail01Icon} className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`border rounded-xl p-4 ${n.isRead ? "border-border bg-card" : "border-primary/30 bg-primary/5"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] ${notifTypeColors[n.type] || ""}`}>{n.type}</Badge>
                        {n.emailSent && <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">Email envoyé ✓</Badge>}
                        {!n.emailSent && n.emailSubject && <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-300">Email non envoyé</Badge>}
                      </div>
                      <h4 className="font-medium text-sm">{n.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <div className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</div>
                      {n.sentBy && <div className="text-xs text-muted-foreground mt-0.5">{n.sentBy}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
