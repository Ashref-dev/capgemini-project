"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"

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

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.partnerId) {
      toast.error("Erreur", { description: "Nom, prénom et ID partenaire requis" })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts partenaires</h1>
          <p className="text-sm text-muted-foreground mt-1">{contacts.length} contact{contacts.length > 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Fermer" : "+ Nouveau contact"}
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="p-4 border border-border rounded-lg space-y-4">
          <h2 className="font-semibold text-sm">Ajouter un contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>ID Partenaire *</Label>
              <Input type="number" value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Prénom *</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Nom *</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={form.isPrimary}
              onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isPrimary" className="text-sm">Contact principal</Label>
          </div>
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? "Enregistrement..." : "Ajouter"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Aucun contact</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nom</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Téléphone</th>
                <th className="text-left px-4 py-3 font-medium">Rôle</th>
                <th className="text-left px-4 py-3 font-medium">Partenaire</th>
                <th className="text-left px-4 py-3 font-medium">Contact principal</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.role || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.partner?.name || `#${c.partnerId}`}</td>
                  <td className="px-4 py-3">
                    {c.isPrimary ? (
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        Oui
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Non</span>
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
