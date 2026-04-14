"use client"

import { useAuth } from "@/frontend/hooks/use-auth"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const isAdmin = user.role === "admin" || user.role === "manager"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenue, {user.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Tableau de bord de gestion des partenariats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Partenaires"
          description="Voir et gérer les partenaires"
          href="/dashboard/partners"
        />
        <DashboardCard
          title="Contacts"
          description="Contacts des partenaires"
          href="/dashboard/contacts"
        />
        <DashboardCard
          title="Offres"
          description={isAdmin ? "Gérer les offres" : "Consulter les offres"}
          href="/dashboard/offers"
        />
        <DashboardCard
          title="Événements"
          description={isAdmin ? "Gérer les événements" : "Consulter les événements"}
          href="/dashboard/events"
        />
        <DashboardCard
          title="Historique statuts"
          description="Historique des changements de statut"
          href="/dashboard/status-history"
        />
        <DashboardCard
          title="Dashboard BI"
          description="Analyses et indicateurs"
          href="/dashboard/bi"
        />
        {isAdmin && (
          <DashboardCard
            title="Demandes partenariat"
            description="Gérer les demandes de partenariat"
            href="/dashboard/partnership-requests"
          />
        )}
      </div>
    </div>
  )
}

function DashboardCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      className="block p-5 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors"
    >
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </a>
  )
}
