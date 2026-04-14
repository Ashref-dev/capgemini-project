"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Badge } from "@/frontend/components/ui/badge"
import { Input } from "@/frontend/components/ui/input"
import { Button } from "@/frontend/components/ui/button"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { Label } from "@/frontend/components/ui/label"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  Edit01Icon,
  CheckmarkSquare01Icon,
  Cancel01Icon,
  Money01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

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

  const saveEdit = async () => {
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
            <h1 className="text-2xl font-bold">Gestion des Employés</h1>
            <p className="text-sm text-muted-foreground">
              {employees.length} employé{employees.length > 1 ? "s" : ""} • {activeCount} actif{activeCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <div className="text-sm text-muted-foreground">Total Employés</div>
          <div className="text-2xl font-bold mt-1">{employees.length}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <div className="text-sm text-muted-foreground">Actifs</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{activeCount}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <div className="text-sm text-muted-foreground">Masse Salariale</div>
          <div className="text-2xl font-bold mt-1">{totalSalary.toLocaleString()} TND</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <div className="text-sm text-muted-foreground">Salaire Moyen</div>
          <div className="text-2xl font-bold mt-1">
            {employees.length > 0 ? Math.round(totalSalary / employees.filter(e => e.salary).length).toLocaleString() : 0} TND
          </div>
        </motion.div>
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
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucun employé trouvé</div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Employé</th>
                <th className="text-left px-4 py-3 font-medium">Rôle</th>
                <th className="text-left px-4 py-3 font-medium">Département</th>
                <th className="text-left px-4 py-3 font-medium">Téléphone</th>
                <th className="text-left px-4 py-3 font-medium">Salaire (TND)</th>
                <th className="text-left px-4 py-3 font-medium">Date embauche</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === emp.id ? (
                      <select
                        value={editForm.role || emp.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        {Object.entries(roleLabels).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge className={`text-xs ${roleColors[emp.role] || ""}`}>
                        {roleLabels[emp.role] || emp.role}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === emp.id ? (
                      <Input
                        value={editForm.department || ""}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="h-8 text-xs w-40"
                        placeholder="Département"
                      />
                    ) : (
                      <span className="text-muted-foreground">{emp.department || "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === emp.id ? (
                      <Input
                        value={editForm.phone || ""}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="h-8 text-xs w-36"
                        placeholder="Téléphone"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">{emp.phone || "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === emp.id ? (
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon icon={Money01Icon} className="w-3 h-3 text-muted-foreground" />
                        <Input
                          type="number"
                          value={editForm.salary ?? ""}
                          onChange={(e) => setEditForm({ ...editForm, salary: e.target.value ? Number(e.target.value) : null })}
                          className="h-8 text-xs w-24"
                          placeholder="Salaire"
                        />
                      </div>
                    ) : (
                      <span className={`font-medium ${emp.salary ? "text-foreground" : "text-muted-foreground"}`}>
                        {emp.salary ? `${emp.salary.toLocaleString()} TND` : "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === emp.id ? (
                      <select
                        value={editForm.isActive ? "true" : "false"}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        <option value="true">Actif</option>
                        <option value="false">Inactif</option>
                      </select>
                    ) : (
                      <Badge className={emp.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"}>
                        {emp.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === emp.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveEdit}
                          disabled={saving}
                          className="text-green-600 hover:text-green-700"
                        >
                          <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="text-red-600 hover:text-red-700"
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(emp)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <HugeiconsIcon icon={Edit01Icon} className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
