"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ContactBookIcon, CheckmarkSquare01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Badge } from "@/frontend/components/ui/badge"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"

interface Contact {
  id: number
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  role: string | null
  isPrimary: boolean
}

export default function PartnerContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    isPrimary: false,
  })

  const fetchContacts = () => {
    fetch("/api/partner/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Prénom et nom sont requis")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/partner/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success("Contact ajouté avec succès")
        setForm({ firstName: "", lastName: "", email: "", phone: "", role: "", isPrimary: false })
        setShowForm(false)
        fetchContacts()
      } else {
        const data = await res.json()
        toast.error(data.error || "Erreur lors de l'ajout")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Contacts</h1>
          <p className="text-muted-foreground mt-1">{contacts.length} contact(s)</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowForm(!showForm)}
        >
          <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
          {showForm ? "Fermer" : "Nouveau contact"}
        </Button>
      </motion.div>

      {/* Add contact form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <HugeiconsIcon icon={ContactBookIcon} className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Nouveau contact</h3>
            </div>
            <Button
              type="submit"
              form="contact-form"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {saving ? (
                "Ajout..."
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </div>

          <form id="contact-form" onSubmit={handleSubmit} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold">Prénom *</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold">Nom *</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold">Fonction</Label>
                <Input id="role" name="role" value={form.role} onChange={handleChange} placeholder="Ex: Directeur..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-semibold">Email</Label>
                <Input id="contactEmail" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-semibold">Téléphone</Label>
                <Input id="contactPhone" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handleChange} className="rounded border-input" />
                  Contact principal
                </label>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Contact list */}
      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <HugeiconsIcon icon={ContactBookIcon} className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucun contact pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {contacts.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {contact.firstName} {contact.lastName}
                  </span>
                  {contact.isPrimary && <Badge>Principal</Badge>}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {contact.role && <span>{contact.role}</span>}
                  {contact.email && <span>{contact.email}</span>}
                  {contact.phone && <span>{contact.phone}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
