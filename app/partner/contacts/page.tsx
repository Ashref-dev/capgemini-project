"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { ContactBookIcon, CheckmarkSquare01Icon, Mail01Icon, Call02Icon, UserIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Spinner } from "@/frontend/components/ui/spinner"
import { toast } from "@/frontend/components/ui/toast"
import { AddButton } from "@/frontend/components/ui/add-button"
import { SparklesText } from "@/frontend/components/ui/sparkles-text"
import { cn } from "@/frontend/lib/utils"

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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <HugeiconsIcon icon={ContactBookIcon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <SparklesText text="Mes Contacts" className="text-2xl" />
            <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} contact{contacts.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <AddButton
          label={showForm ? "Fermer" : "Nouveau contact"}
          onClick={() => setShowForm(!showForm)}
        />
      </motion.div>

      {/* Add contact form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={ContactBookIcon} className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">Nouveau contact</h3>
                </div>
                <Button type="submit" form="contact-form" disabled={saving}
                  className="bg-[#0070AD] hover:bg-[#005a8a] text-white font-medium text-xs h-8 px-3 shadow-sm"
                >
                  {saving ? "Ajout..." : (
                    <><HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-3.5 h-3.5 mr-1.5" />Ajouter</>
                  )}
                </Button>
              </div>
              <form id="contact-form" onSubmit={handleSubmit} className="p-5">
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
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handleChange} className="rounded border-input" />
                      Contact principal
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact list */}
      {contacts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-card border border-border rounded-xl"
        >
          <HugeiconsIcon icon={ContactBookIcon} className="w-12 h-12 mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">Aucun contact pour le moment</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((contact, i) => (
            <motion.div key={contact.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-xl border overflow-hidden bg-card hover:shadow-md hover:border-primary/20 transition-all",
                contact.isPrimary ? "border-primary/30" : "border-border"
              )}
            >
              {contact.isPrimary && <div className="h-0.5 bg-primary" />}
              <div className="p-4 flex items-start gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0 mt-0.5">
                  <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {contact.firstName} {contact.lastName}
                    </span>
                    {contact.isPrimary && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Principal
                      </span>
                    )}
                  </div>
                  {contact.role && (
                    <p className="text-xs text-muted-foreground mt-0.5">{contact.role}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Mail01Icon} className="w-3 h-3" />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Call02Icon} className="w-3 h-3" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

