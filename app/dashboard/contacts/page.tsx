"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { CapgeminiTable, CapgeminiTableColumn, StatusBadge } from "@/components/ui/capgemini-table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Building06Icon,
  CallIcon,
  Delete01Icon,
  Edit02Icon,
  Mail01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { AddButton } from "@/components/ui/add-button"
import { PartnerSelect } from "@/components/ui/partner-select"

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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null)

  const isAdmin = user?.role === "admin" || user?.role === "manager"

  const resetForm = () => {
    setForm({ partnerId: "", firstName: "", lastName: "", email: "", phone: "", role: "", isPrimary: false })
  }

  const startCreate = () => {
    setEditingContact(null)
    resetForm()
    setShowForm((current) => !current)
  }

  const startEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setEditingContact(contact)
    setShowForm(false)
    setForm({
      partnerId: String(contact.partnerId),
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      role: contact.role ?? "",
      isPrimary: contact.isPrimary === true,
    })
  }

  const cancelEdit = () => {
    setEditingContact(null)
    resetForm()
  }

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts")
      const data: { contacts?: Contact[]; error?: string } = await res.json()
      if (res.ok) {
        setContacts(data.contacts ?? [])
      } else {
        toast.error("Erreur", { description: data.error ?? "Impossible de charger les contacts" })
      }
    } catch {
      toast.error("Erreur", { description: "Impossible de charger les contacts" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.partnerId) {
      toast.error("Erreur", { description: "Partenaire, prénom et nom requis" })
      return
    }

    setSaving(true)
    try {
      const url = editingContact ? `/api/contacts?id=${editingContact.id}` : "/api/contacts"
      const res = await fetch(url, {
        method: editingContact ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data: { contact?: Contact; error?: string } = await res.json()
      if (res.ok) {
        toast.success(editingContact ? "Contact mis à jour" : "Contact ajouté", {
          description: editingContact
            ? "Les informations du contact ont été enregistrées."
            : "Le contact est maintenant disponible dans la liste.",
        })
        setShowForm(false)
        setEditingContact(null)
        resetForm()
        await fetchContacts()
        if (data.contact) setSelectedContact({ ...data.contact, partner: data.contact.partner ?? editingContact?.partner ?? null })
      } else {
        toast.error("Erreur", { description: data.error ?? "Impossible d’enregistrer le contact" })
      }
    } catch {
      toast.error("Erreur", { description: "Une erreur est survenue" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteContact) return
    setSaving(true)
    try {
      const res = await fetch(`/api/contacts?id=${deleteContact.id}`, { method: "DELETE" })
      const data: { error?: string } = await res.json()
      if (res.ok) {
        toast.success("Contact supprimé", { description: "La liste des contacts a été mise à jour." })
        if (selectedContact?.id === deleteContact.id) setSelectedContact(null)
        setDeleteContact(null)
        await fetchContacts()
      } else {
        toast.error("Erreur", { description: data.error ?? "Impossible de supprimer ce contact" })
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
        ? <a href={`mailto:${c.email}`} className="text-sm text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{c.email}</a>
        : <span className="text-sm text-muted-foreground">—</span>,
    },
    {
      key: "phone", label: "Téléphone", weight: 1.5,
      render: c => c.phone
        ? <a href={`tel:${c.phone}`} className="text-sm text-muted-foreground font-mono hover:text-foreground" onClick={(e) => e.stopPropagation()}>{c.phone}</a>
        : <span className="text-sm text-muted-foreground">—</span>,
    },
    {
      key: "partner", label: "Partenaire", weight: 2,
      render: c => <span className="text-sm text-muted-foreground">{c.partner?.name || `Partenaire ${c.partnerId}`}</span>,
    },
    {
      key: "primary", label: "Principal", weight: 1,
      render: c => c.isPrimary
        ? <StatusBadge status="info" label="Principal" />
        : <span className="text-xs text-muted-foreground">—</span>,
    },
  ]

  const selectedName = selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <HugeiconsIcon icon={UserMultiple02Icon} className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contacts partenaires</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {contacts.length} contact{contacts.length > 1 ? "s" : ""} référencé{contacts.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {isAdmin && (
          <AddButton label={showForm ? "Fermer" : "Nouveau contact"} onClick={startCreate} />
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-muted/35 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Ajouter un contact</h2>
            <p className="mt-1 text-sm text-muted-foreground">Renseignez uniquement les informations utiles à la prise de contact.</p>
          </div>
          <ContactFormFields form={form} setForm={setForm} />
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Ajouter le contact"}</Button>
          </div>
        </form>
      )}

      <CapgeminiTable<Contact>
        title="Liste des contacts"
        subtitle="Cliquez sur une ligne pour ouvrir les détails sans perdre votre position."
        data={filtered}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun contact trouvé"
        keyExtractor={c => c.id}
        onRowClick={setSelectedContact}
        headerActions={
          <Input
            placeholder="Rechercher un contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 w-full text-sm sm:w-56"
          />
        }
      />

      <Sheet open={selectedContact !== null} onOpenChange={(open) => { if (!open) { setSelectedContact(null); cancelEdit() } }}>
        <SheetContent side="right" className="flex w-full flex-col overflow-y-auto p-0 sm:max-w-xl">
          {selectedContact && (
            <>
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle>{editingContact ? "Modifier le contact" : selectedName}</SheetTitle>
                <SheetDescription>
                  {selectedContact.partner?.name || `Partenaire ${selectedContact.partnerId}`}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-6 px-6 py-5">
                {editingContact ? (
                  <form id="contact-edit-form" onSubmit={handleSubmit} className="space-y-5">
                    <ContactFormFields form={form} setForm={setForm} />
                  </form>
                ) : (
                  <>
                    <div className="rounded-2xl bg-muted/35 p-4">
                      <p className="text-sm text-muted-foreground">Rôle</p>
                      <p className="mt-1 text-base font-medium text-foreground">{selectedContact.role || "Non renseigné"}</p>
                      {selectedContact.isPrimary && <div className="mt-3"><StatusBadge status="info" label="Contact principal" /></div>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <ContactInfo icon={Mail01Icon} label="Email" value={selectedContact.email} href={selectedContact.email ? `mailto:${selectedContact.email}` : undefined} />
                      <ContactInfo icon={CallIcon} label="Téléphone" value={selectedContact.phone} href={selectedContact.phone ? `tel:${selectedContact.phone}` : undefined} />
                      <ContactInfo icon={Building06Icon} label="Partenaire" value={selectedContact.partner?.name || `Partenaire ${selectedContact.partnerId}`} />
                      <ContactInfo icon={UserMultiple02Icon} label="Statut" value={selectedContact.isPrimary ? "Principal" : "Secondaire"} />
                    </div>
                  </>
                )}
              </div>

              {isAdmin && (
                <SheetFooter className="border-t border-border px-6 py-4">
                  {editingContact ? (
                    <>
                      <Button type="button" variant="ghost" onClick={cancelEdit}>Annuler</Button>
                      <Button type="submit" form="contact-edit-form" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
                    </>
                  ) : (
                    <>
                      <Button type="button" variant="outline" className="gap-2" onClick={() => startEdit(selectedContact)}>
                        <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                        Modifier
                      </Button>
                      <Button type="button" variant="ghost" className="gap-2 text-destructive hover:text-destructive" onClick={() => setDeleteContact(selectedContact)}>
                        <HugeiconsIcon icon={Delete01Icon} className="size-4" />
                        Supprimer
                      </Button>
                    </>
                  )}
                </SheetFooter>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteContact !== null} onOpenChange={(open) => { if (!open) setDeleteContact(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce contact ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action retirera {deleteContact ? `${deleteContact.firstName} ${deleteContact.lastName}` : "ce contact"} de la fiche partenaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={saving} onClick={(event) => { event.preventDefault(); handleDelete() }}>
              {saving ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ContactFormFields({
  form,
  setForm,
}: {
  form: {
    partnerId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
    isPrimary: boolean
  }
  setForm: (form: {
    partnerId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
    isPrimary: boolean
  }) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
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
          <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label>Téléphone</Label>
          <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Rôle</Label>
          <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Ex. Responsable partenariat" />
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-xl bg-background/70 px-3 py-2 text-sm">
        <input type="checkbox" checked={form.isPrimary} onChange={e => setForm({ ...form, isPrimary: e.target.checked })} className="size-4 rounded border-border accent-primary" />
        Contact principal
      </label>
    </div>
  )
}

function ContactInfo({
  icon,
  label,
  value,
  href,
}: {
  icon: typeof UserMultiple02Icon
  label: string
  value: string | null | undefined
  href?: string
}) {
  const content = value || "Non renseigné"
  return (
    <div className="rounded-2xl bg-muted/35 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-4" />
        {label}
      </div>
      {href && value ? (
        <a href={href} className="mt-2 block break-words text-sm font-medium text-primary hover:underline">{content}</a>
      ) : (
        <p className="mt-2 break-words text-sm font-medium text-foreground">{content}</p>
      )}
    </div>
  )
}
