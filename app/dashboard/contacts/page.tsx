"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { toast } from "@/frontend/components/ui/toast"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge, DetailPanel, DetailCard } from "@/frontend/components/ui/capgemini-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserMultiple02Icon } from "@hugeicons/core-free-icons"
import { SparklesText } from "@/frontend/components/ui/sparkles-text"
import { AddButton } from "@/frontend/components/ui/add-button"
import { PartnerSelect } from "@/frontend/components/ui/partner-select"

interface Contact {
  id: number
  partnerId: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  role: string | null
  isPrimary: boolean | null
  partner?: { id: number; name: string } | null
}

export default function ContactsPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    partnerId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    isPrimary: false,
  })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const isAdmin = user?.role === "admin" || user?.role === "manager"

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts")
      const data = await res.json()
      if (res.ok) setContacts(data.contacts)
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les contacts" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.partnerId) {
      toast.error("Erreur", { description: "Partenaire, prénom et nom requis" })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Contact ajouté")
        setShowForm(false)
        setForm({ partnerId: "", firstName: "", lastName: "", email: "", phone: "", role: "", isPrimary: false })
        fetchContacts()
      } else {
        toast.error("Erreur", { description: data.error })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    return !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.partner?.name || "").toLowerCase().includes(q)
  })

  const columns: CapgeminiTableColumn<Contact>[] = [
    {
      key: "name", label: "Nom", weight: 2,
      render: c => (
        <div>
          <p className="font-semibold text-sm text-foreground">{c.firstName} {c.lastName}</p>
          {c.role && <p className="text-xs text-muted-foreground mt-0.5">{c.role}</p>}
        </div>
      ),
    },
    {
      key: "email", label: "Email", weight: 2,
      render: c => c.email
        ? <a href={`mailto:${c.email}`} className="text-sm text-primary hover:underline">{c.email}</a>
        : <span className="text-sm text-muted-foreground">—</span>,
    },
    {
      key: "phone", label: "Téléphone", weight: 1.5,
      render: c => <span className="text-sm text-muted-foreground font-mono">{c.phone || "—"}</span>,
    },
    {
      key: "partner", label: "Partenaire", weight: 2,
      render: c => <span className="text-sm text-muted-foreground">{c.partner?.name || `#${c.partnerId}`}</span>,
    },
    {
      key: "primary", label: "Principal", weight: 1,
      render: c => c.isPrimary
        ? <StatusBadge status="info" label="Principal" />
        : <span className="text-xs text-muted-foreground">—</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={UserMultiple02Icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Contacts partenaires" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-1">{contacts.length} contact{contacts.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        {isAdmin && (
          <AddButton label="Nouveau contact" onClick={() => setShowForm(!showForm)} />
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="p-4 border border-border rounded-xl bg-muted/30 space-y-4">
          <h2 className="font-semibold text-sm">Ajouter un contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Partenaire *</Label>
              <PartnerSelect value={form.partnerId} onChange={(id) => setForm({ ...form, partnerId: id })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Prénom *</Label>
              <Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Nom *</Label>
              <Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPrimary" checked={form.isPrimary} onChange={e => setForm({ ...form, isPrimary: e.target.checked })} className="rounded" />
            <Label htmlFor="isPrimary" className="text-sm">Contact principal</Label>
          </div>
          <AddButton type="submit" label={saving ? "Enregistrement..." : "Ajouter"} disabled={saving} />
        </form>
      )}

      <CapgeminiTable<Contact>
        title="Liste des contacts"
        subtitle="Contacts associés aux partenaires"
        data={filtered}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun contact trouvé"
        keyExtractor={c => c.id}
        headerActions={
          <Input
            placeholder="Rechercher un contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 w-48 text-sm"
          />
        }
        renderDetail={(c, onClose) => (
          <DetailPanel onClose={onClose} title={`${c.firstName} ${c.lastName}`}>
            <div className="grid grid-cols-2 gap-3">
              <DetailCard label="Prénom" value={c.firstName} />
              <DetailCard label="Nom" value={c.lastName} />
              <DetailCard label="Email" value={c.email || "—"} />
              <DetailCard label="Téléphone" value={c.phone || "—"} />
              <DetailCard label="Rôle" value={c.role || "—"} />
              <DetailCard label="Partenaire" value={c.partner?.name || `#${c.partnerId}`} />
              <DetailCard label="Contact principal" value={c.isPrimary ? <StatusBadge status="info" label="Oui" /> : "Non"} />
            </div>
          </DetailPanel>
        )}
      />
    </div>
  )
}
