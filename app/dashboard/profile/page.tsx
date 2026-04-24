"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, LockPasswordIcon, UserAdd01Icon, Briefcase01Icon, CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/frontend/hooks/use-auth"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { AddButton } from "@/frontend/components/ui/add-button"
import { Textarea } from "@/frontend/components/ui/textarea"
import { toast } from "@/frontend/components/ui/toast"

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  manager: "Manager",
  commercial: "Commercial",
  analyst: "Analyste",
  rh: "Ressources Humaines",
}

const categoryLabels: Record<string, string> = {
  customer: "Client",
  marketing: "Marketing",
  supplier: "Fournisseur Technologique",
  university: "Universitaire",
}

interface NegotiationPartner {
  id: number
  name: string
  categories: string | null
  email: string | null
  phone: string | null
  description: string | null
  country: string | null
  partnershipLevel: string | null
  partnershipStartDate: string | null
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

  // Negotiation partners (for commercial role)
  const [negotiationPartners, setNegotiationPartners] = useState<NegotiationPartner[]>([])
  const [loadingNegotiation, setLoadingNegotiation] = useState(false)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const isCommercial = user?.role === "commercial"
  const canNegotiate = isCommercial || user?.role === "admin" || user?.role === "manager"

  const fetchNegotiationPartners = useCallback(async () => {
    if (!canNegotiate) return
    setLoadingNegotiation(true)
    try {
      const res = await fetch("/api/partners/negotiate")
      const data = await res.json()
      if (res.ok) {
        setNegotiationPartners(data.partners || [])
      }
    } catch {
      // silent
    } finally {
      setLoadingNegotiation(false)
    }
  }, [canNegotiate])

  useEffect(() => {
    fetchNegotiationPartners()
  }, [fetchNegotiationPartners])

  if (!user) return null

  const handleNegotiationAction = async (partnerId: number, action: "activate" | "terminate", reason?: string) => {
    setProcessingId(partnerId)
    try {
      const res = await fetch("/api/partners/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, action, reason }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(
          action === "activate" ? "Partenariat activé" : "Négociation terminée",
          { description: data.message }
        )
        setNegotiationPartners((prev) => prev.filter((p) => p.id !== partnerId))
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setProcessingId(null)
    }
  }

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
          <div className="flex items-center gap-3 p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
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
          <div className="flex items-center gap-3 p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
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

        {/* Commercial: Negotiation Pipeline */}
        {canNegotiate && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
                  <HugeiconsIcon icon={Briefcase01Icon} className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Pipeline de négociation</h2>
                  <p className="text-sm text-muted-foreground">Partenaires en attente de décision commerciale</p>
                </div>
              </div>
              {negotiationPartners.length > 0 && (
                <span className="bg-amber-500/10 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  {negotiationPartners.length} en attente
                </span>
              )}
            </div>
            <div className="p-6">
              {loadingNegotiation ? (
                <p className="text-sm text-muted-foreground text-center py-4">Chargement...</p>
              ) : negotiationPartners.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun partenaire en négociation pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {negotiationPartners.map((partner) => (
                    <div key={partner.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-foreground">{partner.name}</h3>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {categoryLabels[partner.categories || ""] || partner.categories}
                            </span>
                            {partner.partnershipLevel && (
                              <span className="bg-muted px-2 py-0.5 rounded-full">{partner.partnershipLevel}</span>
                            )}
                            {partner.country && (
                              <span className="bg-muted px-2 py-0.5 rounded-full">{partner.country}</span>
                            )}
                          </div>
                          {partner.email && (
                            <p className="text-xs text-muted-foreground mt-1">📧 {partner.email}</p>
                          )}
                          {partner.phone && (
                            <p className="text-xs text-muted-foreground">📞 {partner.phone}</p>
                          )}
                          {partner.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{partner.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleNegotiationAction(partner.id, "activate")}
                            disabled={processingId === partner.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-1" />
                            {processingId === partner.id ? "..." : "Valider"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const reason = prompt("Motif du refus (optionnel) :")
                              handleNegotiationAction(partner.id, "terminate", reason || undefined)
                            }}
                            disabled={processingId === partner.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Commercial: Partnership Request Section */}
        {isCommercial && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
            <div className="flex items-center gap-3 p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
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
                <Button type="submit" disabled={submittingPartner} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
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
