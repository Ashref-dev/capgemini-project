"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon, UserIcon, CheckmarkSquare01Icon, Money01Icon, Edit02Icon } from "@hugeicons/core-free-icons"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge } from "@/components/ui/capgemini-table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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

const formatSalary = (salary: number | null) =>
  salary != null ? `${salary.toLocaleString("fr-FR")} TND` : "—"

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString("fr-FR") : "—"

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

export default function HREmployeesPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Employee>>({})
  const [saving, setSaving] = useState(false)

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

  const openDetail = (emp: Employee) => {
    setSelectedEmployee(emp)
    setIsEditing(false)
    setEditForm({})
  }

  const startEdit = (emp: Employee) => {
    setIsEditing(true)
    setEditForm({
      salary: emp.salary,
      department: emp.department,
      phone: emp.phone,
      role: emp.role,
      isActive: emp.isActive,
    })
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const closeDetail = () => {
    setSelectedEmployee(null)
    setIsEditing(false)
    setEditForm({})
  }

  const saveEdit = async () => {
    if (!selectedEmployee) return
    setSaving(true)
    try {
      const res = await fetch("/api/hr/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEmployee.id, ...editForm }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Employé mis à jour", { description: "Les modifications ont été enregistrées." })
        setSelectedEmployee({ ...selectedEmployee, ...editForm })
        setIsEditing(false)
        setEditForm({})
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
                {formatSalary(emp.salary)}
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
        onRowClick={openDetail}
      />

      {/* Detail / edit drawer */}
      <Sheet open={selectedEmployee !== null} onOpenChange={(open) => { if (!open) closeDetail() }}>
        <SheetContent side="right" className="flex w-full flex-col overflow-y-auto p-0 sm:max-w-xl">
          {selectedEmployee && (
            <>
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle>
                  {isEditing ? "Modifier l'employé" : `${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                </SheetTitle>
                <SheetDescription asChild>
                  <span className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[selectedEmployee.role] || ""}`}>
                      {roleLabels[selectedEmployee.role] || selectedEmployee.role}
                    </span>
                  </span>
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 px-6 py-5">
                {isEditing ? (
                  <form
                    id="employee-edit-form"
                    onSubmit={(e) => { e.preventDefault(); saveEdit() }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rôle</Label>
                      <select
                        value={editForm.role ?? selectedEmployee.role}
                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
                        className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <option value="true">Actif</option>
                        <option value="false">Inactif</option>
                      </select>
                    </div>
                  </form>
                ) : (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
                    <DetailRow label="Email" value={selectedEmployee.email} />
                    <DetailRow label="Téléphone" value={selectedEmployee.phone || "—"} />
                    <DetailRow label="Rôle" value={roleLabels[selectedEmployee.role] || selectedEmployee.role} />
                    <DetailRow label="Département" value={selectedEmployee.department || "—"} />
                    <DetailRow label="Salaire" value={formatSalary(selectedEmployee.salary)} />
                    <DetailRow label="Date d'embauche" value={formatDate(selectedEmployee.hireDate)} />
                    <DetailRow
                      label="Statut"
                      value={<StatusBadge status={selectedEmployee.isActive ? "success" : "neutral"} label={selectedEmployee.isActive ? "Actif" : "Inactif"} />}
                    />
                  </dl>
                )}
              </div>

              <SheetFooter className="border-t border-border px-6 py-4">
                {isEditing ? (
                  <>
                    <Button type="button" variant="ghost" onClick={cancelEdit} disabled={saving}>Annuler</Button>
                    <Button type="submit" form="employee-edit-form" disabled={saving} className="gap-2">
                      <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4" />
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => startEdit(selectedEmployee)}
                  >
                    <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                    Modifier
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

