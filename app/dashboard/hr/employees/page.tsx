"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon, UserIcon, CheckmarkSquare01Icon, Money01Icon } from "@hugeicons/core-free-icons"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge, DetailPanel, DetailCard } from "@/components/ui/capgemini-table"
import { SparklesText } from "@/components/ui/sparkles-text"
import { GradientStatCard } from "@/components/ui/gradient-stat-card"

interface Employee {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  phone: string | null
  department: string | null
  salary: number | null
  hireDate: string | null
  createdAt: string | null
}

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  manager: "Manager",
  commercial: "Commercial",
  analyst: "Analyste",
  rh: "Ressources Humaines",
}

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  commercial: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  analyst: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  rh: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

export default function HREmployeesPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Employee>>({})
  const [saving, setSaving] = useState(false)
  const closeDetailRef = useRef<(() => void) | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/hr/employees")
      const data = await res.json()
      if (res.ok) {
        setEmployees(data.employees)
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les employés" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id)
    setEditForm({
      salary: emp.salary,
      department: emp.department,
      phone: emp.phone,
      role: emp.role,
      isActive: emp.isActive,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (onClose?: () => void) => {
    if (!editingId) return
    setSaving(true)
    try {
      const res = await fetch("/api/hr/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Employé mis à jour", { description: "Les modifications ont été enregistrées." })
        setEditingId(null)
        setEditForm({})
        onClose?.()
        fetchEmployees()
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de sauvegarder" })
    } finally {
      setSaving(false)
    }
  }

  const filtered = employees.filter((e) => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || e.role === roleFilter
    return matchSearch && matchRole
  })

  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0)
  const activeCount = employees.filter((e) => e.isActive).length

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={UserGroupIcon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Gestion des Employés" className="text-2xl" />
            <p className="text-sm text-muted-foreground">
              {employees.length} employé{employees.length > 1 ? "s" : ""} • {activeCount} actif{activeCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GradientStatCard value={employees.length} label="Total Employés" glowColor="blue" index={0} />
        <GradientStatCard value={activeCount} label="Actifs" glowColor="emerald" index={1} />
        <GradientStatCard value={`${totalSalary.toLocaleString()} TND`} label="Masse Salariale" glowColor="amber" index={2} />
        <GradientStatCard
          value={`${employees.length > 0 ? Math.round(totalSalary / employees.filter(e => e.salary).length).toLocaleString() : 0} TND`}
          label="Salaire Moyen"
          glowColor="cyan"
          index={3}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">Tous les rôles</option>
          {Object.entries(roleLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {(search || roleFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setRoleFilter("") }}>
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Table */}
      <CapgeminiTable<Employee>
        title="Employés"
        subtitle="Cliquer sur une ligne pour voir les détails ou modifier"
        data={filtered}
        columns={[
          {
            key: "employee", label: "Employé", weight: 2.5,
            render: emp => (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                  <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-muted-foreground">{emp.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role", label: "Rôle", weight: 1.5,
            render: emp => (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[emp.role] || ""}`}>
                {roleLabels[emp.role] || emp.role}
              </span>
            ),
          },
          {
            key: "dept", label: "Département", weight: 1.5,
            render: emp => <span className="text-sm text-muted-foreground">{emp.department || "—"}</span>,
          },
          {
            key: "salary", label: "Salaire", weight: 1.5,
            render: emp => (
              <span className={`text-sm font-medium ${emp.salary ? "text-foreground" : "text-muted-foreground"}`}>
                {emp.salary ? `${emp.salary.toLocaleString()} TND` : "—"}
              </span>
            ),
          },
          {
            key: "hire", label: "Date embauche", weight: 1.5,
            render: emp => (
              <span className="text-sm text-muted-foreground">
                {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString("fr-FR") : "—"}
              </span>
            ),
          },
          {
            key: "status", label: "Statut", weight: 1,
            render: emp => <StatusBadge status={emp.isActive ? "success" : "neutral"} label={emp.isActive ? "Actif" : "Inactif"} />,
          },
        ] satisfies CapgeminiTableColumn<Employee>[]}
        loading={loading}
        emptyMessage="Aucun employé trouvé"
        keyExtractor={emp => emp.id}
        getRowGradient={emp => emp.isActive ? "from-emerald-500/8 to-transparent" : "from-muted/20 to-transparent"}
        renderDetail={(emp, onClose) => {
          const isEditing = editingId === emp.id
          return (
            <DetailPanel
              onClose={() => { if (isEditing) cancelEdit(); onClose(); }}
              title={`${emp.firstName} ${emp.lastName}`}
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rôle</Label>
                      <select
                        value={editForm.role ?? emp.role}
                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                      >
                        {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Département</Label>
                      <Input value={editForm.department ?? ""} onChange={e => setEditForm({ ...editForm, department: e.target.value })} placeholder="Département" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Téléphone</Label>
                      <Input value={editForm.phone ?? ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Téléphone" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Salaire (TND)</Label>
                      <div className="relative">
                        <HugeiconsIcon icon={Money01Icon} className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input type="number" className="pl-8" value={editForm.salary ?? ""} onChange={e => setEditForm({ ...editForm, salary: e.target.value ? Number(e.target.value) : null })} placeholder="0" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</Label>
                      <select
                        value={editForm.isActive ? "true" : "false"}
                        onChange={e => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                        className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                      >
                        <option value="true">Actif</option>
                        <option value="false">Inactif</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => saveEdit(onClose)} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />
                      {saving ? "Enregistrement..." : "Sauvegarder"}
                    </Button>
                    <Button variant="ghost" onClick={cancelEdit}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <DetailCard label="Email" value={emp.email} />
                    <DetailCard label="Téléphone" value={emp.phone || "—"} />
                    <DetailCard label="Rôle" value={roleLabels[emp.role] || emp.role} />
                    <DetailCard label="Département" value={emp.department || "—"} />
                    <DetailCard label="Salaire" value={emp.salary ? `${emp.salary.toLocaleString()} TND` : "—"} />
                    <DetailCard label="Date embauche" value={emp.hireDate ? new Date(emp.hireDate).toLocaleDateString("fr-FR") : "—"} />
                    <DetailCard label="Statut" value={<StatusBadge status={emp.isActive ? "success" : "neutral"} label={emp.isActive ? "Actif" : "Inactif"} />} />
                  </div>
                  <Button onClick={() => startEdit(emp)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Modifier cet employé
                  </Button>
                </div>
              )}
            </DetailPanel>
          )
        }}
      />
    </div>
  )
}

