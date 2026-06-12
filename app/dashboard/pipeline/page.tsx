"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ConnectIcon,
  Discount01Icon,
  ContactBookIcon,
  MortarboardIcon,
  ArrowRight01Icon,
  AlertCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type TabKey = "offers" | "requests" | "recruitments"
const TAB_KEYS: TabKey[] = ["offers", "requests", "recruitments"]

type Offer = {
  id: number
  partnerId: number
  title: string
  description: string | null
  discountType: string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean | null
  partner?: { id: number; name: string } | null
}

type PartnershipRequest = {
  id: number
  companyName: string
  contactName: string | null
  contactEmail: string | null
  category: string | null
  status: string | null
  createdAt: string | null
}

type StudentRecruitment = {
  id: number
  studentFirstName: string | null
  studentLastName: string | null
  recruitmentType: string | null
  startDate: string | null
  endDate: string | null
  specialization: string | null
  universityPartnerId: number | null
  universityPartner?: { id: number; name: string } | null
  convertedToCdi: boolean | null
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return "—"
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function StatusPill({ status, intent = "neutral" }: { status: string; intent?: "success" | "warning" | "danger" | "neutral" }) {
  const tints: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", tints[intent])}>
      {status}
    </span>
  )
}

function intentForOfferStatus(active: boolean | null): "success" | "neutral" {
  return active ? "success" : "neutral"
}

function intentForRequestStatus(s: string | null): "success" | "warning" | "danger" | "neutral" {
  if (!s) return "neutral"
  const v = s.toLowerCase()
  if (v.includes("approved") || v.includes("accept")) return "success"
  if (v.includes("pending") || v.includes("attente")) return "warning"
  if (v.includes("reject") || v.includes("refus")) return "danger"
  return "neutral"
}

function intentForRecruitment(r: StudentRecruitment): "success" | "warning" | "neutral" {
  if (r.convertedToCdi) return "success"
  if (!r.endDate) return "warning"
  const end = new Date(r.endDate)
  return Number.isNaN(end.getTime()) || end.getTime() < Date.now() ? "neutral" : "warning"
}

function recruitmentLabel(r: StudentRecruitment): string {
  if (r.convertedToCdi) return "CDI"
  if (!r.endDate) return "En cours"
  const end = new Date(r.endDate)
  if (Number.isNaN(end.getTime())) return r.recruitmentType ?? "—"
  return end.getTime() < Date.now() ? "Terminé" : "En cours"
}

function fullStudentName(r: StudentRecruitment): string {
  const first = r.studentFirstName?.trim() ?? ""
  const last = r.studentLastName?.trim() ?? ""
  const full = `${first} ${last}`.trim()
  return full || `Étudiant #${r.id}`
}

export default function PipelinePage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initial = (searchParams.get("tab") as TabKey) ?? "offers"
  const [tab, setTab] = React.useState<TabKey>(TAB_KEYS.includes(initial) ? initial : "offers")

  const [offers, setOffers] = React.useState<Offer[]>([])
  const [requests, setRequests] = React.useState<PartnershipRequest[]>([])
  const [recruits, setRecruits] = React.useState<StudentRecruitment[]>([])
  const [loadingOff, setLoadingOff] = React.useState(true)
  const [loadingReq, setLoadingReq] = React.useState(true)
  const [loadingRec, setLoadingRec] = React.useState(true)
  const [errOff, setErrOff] = React.useState<string | null>(null)
  const [errReq, setErrReq] = React.useState<string | null>(null)
  const [errRec, setErrRec] = React.useState<string | null>(null)

  React.useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/offers")
        const d = await r.json()
        if (!r.ok) throw new Error(d.error ?? "Erreur")
        setOffers(d.offers ?? [])
      } catch (e) {
        setErrOff((e as Error).message)
      } finally {
        setLoadingOff(false)
      }
    })()
    void (async () => {
      try {
        const r = await fetch("/api/partnership-requests")
        const d = await r.json()
        if (!r.ok) throw new Error(d.error ?? "Erreur")
        setRequests(d.requests ?? d.partnershipRequests ?? [])
      } catch (e) {
        setErrReq((e as Error).message)
      } finally {
        setLoadingReq(false)
      }
    })()
    void (async () => {
      try {
        const r = await fetch("/api/hr/recruitments")
        const d = await r.json()
        if (!r.ok) throw new Error(d.error ?? "Erreur")
        setRecruits(d.recruitments ?? d.studentRecruitments ?? [])
      } catch (e) {
        setErrRec((e as Error).message)
      } finally {
        setLoadingRec(false)
      }
    })()
  }, [])

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [tab, router, searchParams])

  if (!user) return null

  const stats = [
    {
      label: "Offres actives",
      value: offers.filter((o) => o.isActive).length,
      icon: Discount01Icon,
      tint: "text-blue-600",
    },
    {
      label: "Demandes en attente",
      value: requests.filter((r) => intentForRequestStatus(r.status) === "warning").length,
      icon: ContactBookIcon,
      tint: "text-amber-600",
    },
    {
      label: "Recrutements en cours",
      value: recruits.filter((r) => intentForRecruitment(r) === "warning").length,
      icon: MortarboardIcon,
      tint: "text-emerald-600",
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={ConnectIcon} className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Pipeline
            </span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pipeline commercial &amp; RH
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Une vue unifiée de toutes vos opportunités, demandes et recrutements en cours.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 + i * 0.05 }}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
              <HugeiconsIcon icon={card.icon} className={cn("h-4 w-4", card.tint)} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
        <TabsList className="h-10 w-full justify-start gap-1 bg-muted/40 p-1">
          <TabsTrigger value="offers" className="gap-1.5 text-xs">
            <HugeiconsIcon icon={Discount01Icon} className="h-3.5 w-3.5" />
            Offres
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5 text-xs">
            <HugeiconsIcon icon={ContactBookIcon} className="h-3.5 w-3.5" />
            Demandes
          </TabsTrigger>
          <TabsTrigger value="recruitments" className="gap-1.5 text-xs">
            <HugeiconsIcon icon={MortarboardIcon} className="h-3.5 w-3.5" />
            Recrutements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="mt-4">
          <PipelineSection
            title="Offres commerciales"
            count={offers.length}
            loading={loadingOff}
            error={errOff}
            emptyText="Aucune offre"
            manageHref="/dashboard/offers"
            manageLabel="Gérer les offres"
          >
            {offers.map((o, i) => (
              <PipelineRow
                key={o.id}
                index={i}
                href="/dashboard/offers"
                title={o.title}
                subtitle={o.partner?.name ?? "Partenaire inconnu"}
                meta={
                  <span>
                    {o.discountType ?? "—"} · {formatDate(o.startDate)} → {formatDate(o.endDate)}
                  </span>
                }
                badge={<StatusPill status={o.isActive ? "Actif" : "Inactif"} intent={intentForOfferStatus(o.isActive)} />}
              />
            ))}
          </PipelineSection>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <PipelineSection
            title="Demandes de partenariat"
            count={requests.length}
            loading={loadingReq}
            error={errReq}
            emptyText="Aucune demande"
            manageHref="/dashboard/partnership-requests"
            manageLabel="Gérer les demandes"
          >
            {requests.map((r, i) => (
              <PipelineRow
                key={r.id}
                index={i}
                href="/dashboard/partnership-requests"
                title={r.companyName}
                subtitle={r.contactName ?? r.contactEmail ?? "—"}
                meta={
                  <span>
                    {r.category ?? "—"} · {formatDate(r.createdAt)}
                  </span>
                }
                badge={<StatusPill status={r.status ?? "—"} intent={intentForRequestStatus(r.status)} />}
              />
            ))}
          </PipelineSection>
        </TabsContent>

        <TabsContent value="recruitments" className="mt-4">
          <PipelineSection
            title="Recrutements étudiants"
            count={recruits.length}
            loading={loadingRec}
            error={errRec}
            emptyText="Aucun recrutement"
            manageHref="/dashboard/hr/recruitments"
            manageLabel="Gérer les recrutements"
          >
            {recruits.map((r, i) => (
              <PipelineRow
                key={r.id}
                index={i}
                href="/dashboard/hr/recruitments"
                title={fullStudentName(r)}
                subtitle={r.universityPartner?.name ?? r.specialization ?? "—"}
                meta={
                  <span>
                    {r.recruitmentType ?? "Stage / Alternance"} · {formatDate(r.startDate)} → {formatDate(r.endDate)}
                  </span>
                }
                badge={<StatusPill status={recruitmentLabel(r)} intent={intentForRecruitment(r)} />}
              />
            ))}
          </PipelineSection>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface PipelineSectionProps {
  title: string
  count: number
  loading: boolean
  error: string | null
  emptyText: string
  manageHref: string
  manageLabel: string
  children?: React.ReactNode
}

function PipelineSection({
  title,
  count,
  loading,
  error,
  emptyText,
  manageHref,
  manageLabel,
  children,
}: PipelineSectionProps) {
  const childArray = React.Children.toArray(children)
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {count} élément{count > 1 ? "s" : ""}
          </p>
        </div>
        <Link href={manageHref}>
          <Button size="sm" variant="outline" className="gap-1.5">
            {manageLabel}
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2 p-5">
          {["x1", "x2", "x3"].map((k) => (
            <div key={k} className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
              <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="h-3 w-1/3 rounded bg-muted-foreground/20" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 px-5 py-12">
          <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      ) : childArray.length === 0 ? (
        <div className="flex flex-col items-center gap-1 px-5 py-12 text-center">
          <p className="text-sm font-medium text-foreground">{emptyText}</p>
          <p className="text-xs text-muted-foreground">Rien à afficher pour le moment.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">{childArray}</ul>
      )}
    </div>
  )
}

interface PipelineRowProps {
  index: number
  href: string
  title: string
  subtitle: string
  meta: React.ReactNode
  badge: React.ReactNode
}

function PipelineRow({ index, href, title, subtitle, meta, badge }: PipelineRowProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.02 }}
    >
      <Link
        href={href}
        className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-xs text-muted-foreground sm:w-1/3">{meta}</div>
        <div className="flex items-center gap-2">
          {badge}
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </motion.li>
  )
}
