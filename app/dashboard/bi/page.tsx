"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnalyticsUpIcon, DashboardSquare01Icon } from "@hugeicons/core-free-icons"

interface BIData {
  byCategory: { partner_category: string; count: string }[]
  byStatus: { statut_partenariat: string; count: string }[]
  byLevel: { partnership_level: string; count: string }[]
  topRevenue: { name: string; partner_category: string; annual_revenue_generated: string; satisfaction_score: string }[]
  eventsSummary: { total_events: string; total_participants: string; total_budget: string; total_revenue: string }
  projectsSummary: { total_projects: string; total_value: string; avg_satisfaction: string }
  recruitmentSummary: { total_students: string; total_cdi: string; avg_satisfaction: string }
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-4 border border-border rounded-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

function BarChart({ data, labelKey, valueKey }: { data: Record<string, string>[]; labelKey: string; valueKey: string }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1)
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm w-32 truncate text-right">{d[labelKey] || "N/A"}</span>
          <div className="flex-1 bg-muted/50 rounded-full h-6 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${Math.max((Number(d[valueKey]) / max) * 100, 8)}%` }}
            >
              <span className="text-xs text-white font-medium">{d[valueKey]}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatNum(n: string | number | null) {
  if (!n) return "0"
  const num = Number(n)
  if (isNaN(num)) return "0"
  return num.toLocaleString("fr-FR")
}

function formatTND(n: string | number | null) {
  if (!n) return "0 TND"
  const num = Number(n)
  if (isNaN(num)) return "0 TND"
  return num.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " TND"
}

export default function BIDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<BIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "powerbi">("overview")
  const [powerbiUrls, setPowerbiUrls] = useState<{ label: string; url: string }[]>([
    { label: "Dashboard Partenariats", url: "" },
  ])
  const [newLabel, setNewLabel] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [selectedPBI, setSelectedPBI] = useState(0)

  const fetchBI = useCallback(async () => {
    try {
      const res = await fetch("/api/bi")
      const json = await res.json()
      if (res.ok) setData(json)
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les données BI" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBI()
  }, [fetchBI])

  if (!user) return null

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner /></div>
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Données indisponibles</div>
  }

  const isAnalyst = user?.role === "analyst"

  const totalPartners = data.byCategory.reduce((acc, c) => acc + Number(c.count), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard BI</h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d&apos;ensemble depuis le Data Warehouse</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            <HugeiconsIcon icon={AnalyticsUpIcon} className="w-4 h-4 mr-2" />
            Vue d&apos;ensemble
          </Button>
          <Button
            variant={activeTab === "powerbi" ? "default" : "ghost"}
            onClick={() => setActiveTab("powerbi")}
            className={activeTab === "powerbi" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            <HugeiconsIcon icon={DashboardSquare01Icon} className="w-4 h-4 mr-2" />
            Power BI
          </Button>
        </div>
      </div>

      {activeTab === "powerbi" ? (
        <div className="space-y-6">
          {/* PowerBI Dashboard List */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={DashboardSquare01Icon} className="w-5 h-5 text-primary" />
                Dashboards Power BI
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Intégrez vos dashboards Power BI en collant l&apos;URL d&apos;intégration (Publish to web)
              </p>
            </div>

            {/* Tab list for multiple dashboards */}
            {powerbiUrls.length > 0 && (
              <div className="flex gap-1 p-3 border-b border-border bg-muted/30 overflow-x-auto">
                {powerbiUrls.map((pbi, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPBI(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedPBI === i
                        ? "bg-blue-600 text-white"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {pbi.label || `Dashboard ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Iframe display */}
            <div className="p-4">
              {powerbiUrls[selectedPBI]?.url ? (
                <div className="rounded-lg overflow-hidden border border-border">
                  <iframe
                    title={powerbiUrls[selectedPBI].label}
                    src={powerbiUrls[selectedPBI].url}
                    className="w-full border-0"
                    style={{ height: "600px" }}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <HugeiconsIcon icon={DashboardSquare01Icon} className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Aucun dashboard configuré</p>
                  <p className="text-xs mt-1">Ajoutez une URL Power BI &quot;Publish to web&quot; ci-dessous</p>
                </div>
              )}
            </div>
          </div>

          {/* Add new dashboard - Analyst only */}
          {isAnalyst && (
          <div className="border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Ajouter un dashboard Power BI</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nom du dashboard</Label>
                <Input
                  placeholder="Ex: Suivi Partenariats"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">URL d&apos;intégration Power BI</Label>
                <Input
                  placeholder="https://app.powerbi.com/view?r=..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!newUrl.trim()) {
                    toast.error("L'URL est requise")
                    return
                  }
                  setPowerbiUrls((urls) => [...urls, { label: newLabel || `Dashboard ${urls.length + 1}`, url: newUrl.trim() }])
                  setSelectedPBI(powerbiUrls.length)
                  setNewLabel("")
                  setNewUrl("")
                  toast.success("Dashboard ajouté")
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Ajouter
              </Button>
              {powerbiUrls.length > 0 && powerbiUrls[selectedPBI]?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    setPowerbiUrls((urls) => urls.filter((_, i) => i !== selectedPBI))
                    setSelectedPBI(0)
                    toast.info("Dashboard supprimé")
                  }}
                >
                  Supprimer le dashboard sélectionné
                </Button>
              )}
            </div>
          </div>
          )}
        </div>
      ) : (
        <>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total partenaires" value={formatNum(totalPartners)} />
        <StatCard label="Événements" value={formatNum(data.eventsSummary.total_events)} sub={`${formatNum(data.eventsSummary.total_participants)} participants`} />
        <StatCard label="Projets" value={formatNum(data.projectsSummary.total_projects)} sub={`Valeur: ${formatTND(data.projectsSummary.total_value)}`} />
        <StatCard label="Étudiants recrutés" value={formatNum(data.recruitmentSummary.total_students)} sub={`${formatNum(data.recruitmentSummary.total_cdi)} CDI`} />
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Budget événements" value={formatTND(data.eventsSummary.total_budget)} sub={`Revenu: ${formatTND(data.eventsSummary.total_revenue)}`} />
        <StatCard label="Satisfaction projets" value={Number(data.projectsSummary.avg_satisfaction || 0).toFixed(1) + "/10"} />
        <StatCard label="Satisfaction recrutement" value={Number(data.recruitmentSummary.avg_satisfaction || 0).toFixed(1) + "/10"} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border border-border rounded-lg space-y-4">
          <h2 className="font-semibold">Par catégorie</h2>
          <BarChart data={data.byCategory} labelKey="partner_category" valueKey="count" />
        </div>

        <div className="p-4 border border-border rounded-lg space-y-4">
          <h2 className="font-semibold">Par statut</h2>
          <BarChart data={data.byStatus} labelKey="statut_partenariat" valueKey="count" />
        </div>

        <div className="p-4 border border-border rounded-lg space-y-4">
          <h2 className="font-semibold">Par niveau</h2>
          <BarChart data={data.byLevel} labelKey="partnership_level" valueKey="count" />
        </div>

        <div className="p-4 border border-border rounded-lg space-y-4">
          <h2 className="font-semibold">Top 10 revenus</h2>
          <div className="space-y-2">
            {data.topRevenue.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{p.partner_category}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{formatTND(p.annual_revenue_generated)}</span>
                  {p.satisfaction_score && (
                    <span className="text-muted-foreground ml-2 text-xs">({Number(p.satisfaction_score).toFixed(1)}/10)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
