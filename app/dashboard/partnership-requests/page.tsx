"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { toast } from "@/frontend/components/ui/toast"
import { Button } from "@/frontend/components/ui/button"
import { Card } from "@/frontend/components/ui/card"
import { Textarea } from "@/frontend/components/ui/textarea"
import { cn } from "@/frontend/lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesText } from "@/frontend/components/ui/sparkles-text"
import { GradientStatCard } from "@/frontend/components/ui/gradient-stat-card"
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Clock01Icon,
  UserGroupIcon,
  Building06Icon,
  Mail01Icon,
  Globe02Icon,
  Calendar03Icon,
  InformationCircleIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"

interface PartnershipRequestAIAnalysis {
  compatibilityScore: number
  confidence: number
  recommendation: "APPROVE" | "REVIEW" | "REJECT"
  summary: string
  reasons: string[]
  riskFlags: string[]
  breakdown: {
    dataCompleteness: number
    strategicFit: number
    reliability: number
    scalePotential: number
    categoryBoost: number
  }
}

interface PartnershipRequest {
  id: number
  companyName: string
  legalName: string | null
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string | null
  contactRole: string | null
  website: string | null
  description: string | null
  country: string | null
  address: string | null
  numEmployees: number | null
  annualRevenue: string | null
  category: string
  partnerSubcategory: string | null
  partnershipLevel: string | null
  motivations: string | null
  universityData: Record<string, unknown> | null
  technologyData: Record<string, unknown> | null
  status: string
  isAccepted: boolean | null
  reviewedBy: number | null
  reviewedAt: string | null
  rejectionReason: string | null
  createdPartnerId: number | null
  createdAt: string
  updatedAt: string
  aiAnalysis?: PartnershipRequestAIAnalysis
}

interface Counts {
  total: number
  pending: number
  accepted: number
  rejected: number
}

const categoryLabels: Record<string, string> = {
  customer: "Client",
  marketing: "Marketing",
  supplier: "Fournisseur Technologique",
  university: "Universitaire",
}

const categoryColors: Record<string, string> = {
  customer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  marketing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  supplier: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  university: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

const statusStyles: Record<string, string> = {
  en_attente: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  acceptee: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  refusee: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Refusée",
}

const aiRecommendationStyles: Record<PartnershipRequestAIAnalysis["recommendation"], string> = {
  APPROVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  REVIEW: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  REJECT: "bg-red-500/10 text-red-600 dark:text-red-400",
}

const aiRecommendationBars: Record<PartnershipRequestAIAnalysis["recommendation"], string> = {
  APPROVE: "bg-emerald-500",
  REVIEW: "bg-amber-500",
  REJECT: "bg-red-500",
}

const aiRecommendationLabels: Record<PartnershipRequestAIAnalysis["recommendation"], string> = {
  APPROVE: "AI: Prioritaire",
  REVIEW: "AI: À revoir",
  REJECT: "AI: Faible alignement",
}

export default function PartnershipRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<PartnershipRequest[]>([])
  const [counts, setCounts] = useState<Counts>({ total: 0, pending: 0, accepted: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState<number | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      const url = statusFilter ? `/api/admin/partnership-requests?status=${statusFilter}` : "/api/admin/partnership-requests"
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRequests(data.requests)
      setCounts(data.counts)
    } catch {
      toast.error("Erreur lors du chargement des demandes")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleAction = async (requestId: number, action: "accept" | "reject") => {
    setProcessing(requestId)
    try {
      const res = await fetch("/api/admin/partnership-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          rejectionReason: action === "reject" ? rejectionReason : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur")
      }
      const data = await res.json()
      toast.success(action === "accept" ? "Partenaire créé avec succès !" : "Demande refusée", {
        description: data.message,
      })
      setRejectingId(null)
      setRejectionReason("")
      setExpandedId(null)
      fetchRequests()
    } catch (err: unknown) {
      toast.error("Erreur", {
        description: err instanceof Error ? err.message : "Impossible de traiter la demande",
      })
    } finally {
      setProcessing(null)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <HugeiconsIcon icon={UserGroupIcon} className="w-5 h-5 text-primary" />
        </div>
        <div>
          <SparklesText text="Demandes de partenariat" className="text-2xl" />
          <p className="text-muted-foreground mt-1">Gérez les demandes de partenariat soumises par les entreprises.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GradientStatCard icon={UserGroupIcon} value={counts.total} label="Total" glowColor="blue" index={0} />
        <GradientStatCard icon={Clock01Icon} value={counts.pending} label="En attente" glowColor="amber" index={1} />
        <GradientStatCard icon={CheckmarkCircle02Icon} value={counts.accepted} label="Acceptées" glowColor="emerald" index={2} />
        <GradientStatCard icon={Cancel01Icon} value={counts.rejected} label="Refusées" glowColor="red" index={3} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "", label: "Toutes" },
          { value: "en_attente", label: "En attente" },
          { value: "acceptee", label: "Acceptées" },
          { value: "refusee", label: "Refusées" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setLoading(true) }}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
              statusFilter === f.value ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border hover:border-primary/20"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <HugeiconsIcon icon={InformationCircleIcon} className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aucune demande trouvée.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req, i) => {
            const isExpanded = expandedId === req.id
            const analysis = req.aiAnalysis
            return (
              <RequestCard key={req.id} index={i}>
                  {/* Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HugeiconsIcon icon={Building06Icon} className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground truncate">{req.companyName}</h3>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", categoryColors[req.category])}>
                            {categoryLabels[req.category] || req.category}
                          </span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusStyles[req.status])}>
                            {statusLabels[req.status] || req.status}
                          </span>
                          {analysis && (
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", aiRecommendationStyles[analysis.recommendation])}>
                              {aiRecommendationLabels[analysis.recommendation]}
                            </span>
                          )}
                          {analysis && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#0070AD]/10 text-[#0070AD] dark:text-blue-300">
                              Score AI {analysis.compatibilityScore}/100
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {req.contactFirstName} {req.contactLastName} — {req.contactEmail}
                          {req.createdAt && ` — ${new Date(req.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`}
                        </p>
                      </div>
                    </div>
                    <HugeiconsIcon icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon} className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border"
                    >
                      <div className="p-5 space-y-4">
                        {analysis && (
                          <div className="rounded-lg border border-[#0070AD]/10 bg-[#0070AD]/5 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Analyse automatique</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className="text-2xl font-bold text-foreground">{analysis.compatibilityScore}/100</span>
                                  <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-semibold", aiRecommendationStyles[analysis.recommendation])}>
                                    {aiRecommendationLabels[analysis.recommendation]}
                                  </span>
                                  <span className="text-xs text-muted-foreground">Confiance {analysis.confidence}%</span>
                                </div>
                                <p className="mt-3 text-sm text-foreground">{analysis.summary}</p>
                              </div>
                              <div className="rounded-lg bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                                Aide à la décision uniquement
                              </div>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80 dark:bg-white/10">
                              <div
                                className={cn("h-full rounded-full", aiRecommendationBars[analysis.recommendation])}
                                style={{ width: `${analysis.compatibilityScore}%` }}
                              />
                            </div>

                            {analysis.reasons.length > 0 && (
                              <div className="mt-3">
                                <span className="text-xs font-medium text-muted-foreground">Points forts</span>
                                <ul className="mt-1 space-y-1">
                                  {analysis.reasons.map((reason) => (
                                    <li key={reason} className="text-sm text-foreground">• {reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {analysis.riskFlags.length > 0 && (
                              <div className="mt-3 rounded-lg bg-amber-500/10 p-3">
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Points de vigilance</span>
                                <ul className="mt-1 space-y-1">
                                  {analysis.riskFlags.map((flag) => (
                                    <li key={flag} className="text-sm text-foreground">• {flag}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                              {[
                                { label: "Complétude", value: analysis.breakdown.dataCompleteness },
                                { label: "Fit", value: analysis.breakdown.strategicFit },
                                { label: "Fiabilité", value: analysis.breakdown.reliability },
                                { label: "Potentiel", value: analysis.breakdown.scalePotential },
                                { label: "Catégorie", value: analysis.breakdown.categoryBoost },
                              ].map((item) => (
                                <div key={item.label} className="rounded-lg bg-white/70 dark:bg-white/5 px-3 py-2">
                                  <div className="text-[11px] text-muted-foreground">{item.label}</div>
                                  <div className="text-sm font-semibold text-foreground">{item.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Company details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <Detail label="Raison sociale" value={req.legalName} />
                          <Detail label="Pays" value={req.country} />
                          <Detail label="Adresse" value={req.address} />
                          <Detail label="Site web" value={req.website} />
                          <Detail label="Nombre d'employés" value={req.numEmployees?.toString()} />
                          <Detail label="Chiffre d'affaires" value={req.annualRevenue} />
                          <Detail label="Téléphone" value={req.contactPhone} />
                          <Detail label="Rôle contact" value={req.contactRole} />
                          <Detail label="Sous-catégorie" value={req.partnerSubcategory} />
                          <Detail label="Niveau partenariat" value={req.partnershipLevel} />
                        </div>

                        {req.description && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Description :</span>
                            <p className="text-sm text-foreground mt-1">{req.description}</p>
                          </div>
                        )}

                        {req.motivations && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Motivations :</span>
                            <p className="text-sm text-foreground mt-1">{req.motivations}</p>
                          </div>
                        )}

                        {/* University data */}
                        {req.category === "university" && req.universityData && (
                          <div className="bg-amber-500/5 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Données universitaires</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <Detail label="Type institution" value={req.universityData.institutionType as string} />
                              <Detail label="Étudiants" value={req.universityData.numStudents?.toString()} />
                              <Detail label="Stagiaires/an" value={req.universityData.numInternsPerYear?.toString()} />
                              <Detail label="Alternants/an" value={req.universityData.numApprenticesPerYear?.toString()} />
                              <Detail label="Recrutements/an" value={req.universityData.numHiresPerYear?.toString()} />
                              {Array.isArray(req.universityData.specialties) && (
                                <div className="col-span-full">
                                  <span className="text-xs text-muted-foreground">Spécialités :</span>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {(req.universityData.specialties as string[]).map((s) => (
                                      <span key={s} className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Technology data */}
                        {req.category === "supplier" && req.technologyData && (
                          <div className="bg-blue-500/5 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Données technologiques</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <Detail label="Type fournisseur" value={req.technologyData.vendorType as string} />
                              <Detail label="Modèle partenariat" value={req.technologyData.partnershipModel as string} />
                              <Detail label="Certifications" value={req.technologyData.certificationsHeld?.toString()} />
                              <Detail label="Niveau certif." value={req.technologyData.certificationLevel as string} />
                              {Array.isArray(req.technologyData.technologies) && (
                                <div className="col-span-full">
                                  <span className="text-xs text-muted-foreground">Technologies :</span>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {(req.technologyData.technologies as string[]).map((t) => (
                                      <span key={t} className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Rejection reason if already rejected */}
                        {req.status === "refusee" && req.rejectionReason && (
                          <div className="bg-red-500/5 rounded-lg p-4">
                            <span className="text-xs font-medium text-red-600">Motif du refus :</span>
                            <p className="text-sm text-foreground mt-1">{req.rejectionReason}</p>
                          </div>
                        )}

                        {/* Actions for pending requests */}
                        {req.status === "en_attente" && (
                          <div className="flex flex-col gap-3 pt-3 border-t border-border">
                            {rejectingId === req.id ? (
                              <div className="space-y-3">
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Motif du refus (optionnel)..."
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={processing === req.id}
                                    onClick={() => handleAction(req.id, "reject")}
                                  >
                                    {processing === req.id ? "Traitement..." : "Confirmer le refus"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setRejectingId(null); setRejectionReason("") }}
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  disabled={processing === req.id}
                                  onClick={() => handleAction(req.id, "accept")}
                                >
                                  {processing === req.id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                                  ) : (
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-1.5" />
                                  )}
                                  Accepter et créer le partenaire
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                                  onClick={() => setRejectingId(req.id)}
                                >
                                  <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1.5" />
                                  Refuser
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Accepted info */}
                        {req.status === "acceptee" && req.createdPartnerId && (
                          <div className="bg-emerald-500/5 rounded-lg p-4 text-sm">
                            <span className="font-medium text-emerald-600">Partenaire créé</span> — ID #{req.createdPartnerId}
                            {req.reviewedAt && ` — ${new Date(req.reviewedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
              </RequestCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RequestCard({ children, index }: { children: React.ReactNode; index: number }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)
  const rotateX = useTransform(springY, [-0.5, 0.5], ["10.5deg", "-10.5deg"])
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-10.5deg", "10.5deg"])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="overflow-hidden rounded-2xl border border-[#0070AD]/20 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  )
}
