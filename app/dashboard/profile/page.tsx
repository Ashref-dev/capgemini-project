"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, LockPasswordIcon, UserAdd01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddButton } from "@/components/ui/add-button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  manager: "Manager",
  commercial: "Commercial",
  analyst: "Analyste",
  rh: "Ressources Humaines",
}


export default function EmployeeProfilePage() {
  const { user } = useAuth()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [changingPassword, setChangingPassword] = useState(false)

  // Commercial partnership request form
  const [partnerForm, setPartnerForm] = useState({
    companyName: "",
    contactFirstName: "",
    contactLastName: "",
    contactEmail: "",
    contactPhone: "",
    category: "customer" as string,
    description: "",
    country: "Tunisie",
    website: "",
    motivations: "",
  })
  const [submittingPartner, setSubmittingPartner] = useState(false)

  const isCommercial = user?.role === "commercial"

  if (!user) return null

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Tous les champs sont requis")
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Mot de passe modifié avec succès")
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        toast.error(data.error || "Erreur lors du changement de mot de passe")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSubmitPartnerRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerForm.companyName || !partnerForm.contactFirstName || !partnerForm.contactLastName || !partnerForm.contactEmail) {
      toast.error("Tous les champs obligatoires doivent être remplis")
      return
    }

    setSubmittingPartner(true)
    try {
      const res = await fetch("/api/partnership-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...partnerForm,
          contactRole: `Commercial interne — ${user.name}`,
          motivations: `[DEMANDE INTERNE - ${user.name}] ${partnerForm.motivations}`,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Demande de partenariat envoyée", {
          description: "L'administrateur sera notifié de votre demande.",
        })
        setPartnerForm({
          companyName: "",
          contactFirstName: "",
          contactLastName: "",
          contactEmail: "",
          contactPhone: "",
          category: "customer",
          description: "",
          country: "Tunisie",
          website: "",
          motivations: "",
        })
      } else {
        toast.error(data.error || "Erreur lors de l'envoi")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setSubmittingPartner(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Info */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-border bg-muted/20">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Mon Profil</h2>
              <p className="text-sm text-muted-foreground">Informations de votre compte employé</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Nom complet</p>
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Email</p>
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Rôle</p>
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{roleLabels[user.role || ""] || user.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Type de compte</p>
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">Employé Capgemini</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
          <div className="flex items-center gap-3 p-6 border-b border-border bg-muted/20">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <HugeiconsIcon icon={LockPasswordIcon} className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Modifier le mot de passe</h2>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold text-foreground">
                  Mot de passe actuel *
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
                  Nouveau mot de passe *
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                  Confirmer le mot de passe *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <AddButton type="submit" label={changingPassword ? "Modification..." : "Changer le mot de passe"} disabled={changingPassword} />
            </div>
          </form>
        </div>

        {/* Commercial: Partnership Request Section */}
        {isCommercial && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
            <div className="flex items-center gap-3 p-6 border-b border-border bg-muted/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Proposer un nouveau partenaire</h2>
                <p className="text-sm text-muted-foreground">Soumettez une demande interne d&apos;ajout de partenaire</p>
              </div>
            </div>
            <form onSubmit={handleSubmitPartnerRequest} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Nom de l&apos;entreprise *</Label>
                  <Input
                    value={partnerForm.companyName}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, companyName: e.target.value }))}
                    required
                    placeholder="Nom de l'entreprise partenaire"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Catégorie *</Label>
                  <select
                    value={partnerForm.category}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                  >
                    <option value="customer">Client</option>
                    <option value="marketing">Marketing</option>
                    <option value="supplier">Fournisseur</option>
                    <option value="university">Université</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Prénom du contact *</Label>
                  <Input
                    value={partnerForm.contactFirstName}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, contactFirstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Nom du contact *</Label>
                  <Input
                    value={partnerForm.contactLastName}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, contactLastName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Email du contact *</Label>
                  <Input
                    type="email"
                    value={partnerForm.contactEmail}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, contactEmail: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Téléphone du contact</Label>
                  <Input
                    value={partnerForm.contactPhone}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Site web</Label>
                  <Input
                    value={partnerForm.website}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, website: e.target.value }))}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Pays</Label>
                  <Input
                    value={partnerForm.country}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, country: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-foreground">Description de l&apos;entreprise</Label>
                  <Textarea
                    value={partnerForm.description}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Activité, secteur, taille..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-foreground">Motivations / Pourquoi ce partenariat ?</Label>
                  <Textarea
                    value={partnerForm.motivations}
                    onChange={(e) => setPartnerForm((f) => ({ ...f, motivations: e.target.value }))}
                    rows={3}
                    placeholder="Expliquez pourquoi vous recommandez ce partenariat..."
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submittingPartner} className="font-medium">
                  {submittingPartner ? "Envoi en cours..." : "Soumettre la demande"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  )
}
