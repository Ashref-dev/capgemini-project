import Link from "next/link"
import { CapgeminiLogo } from "@/components/icons"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Capgemini Tunisie — Plateforme Partenaires</p>
          <h1 className="text-4xl font-bold text-foreground">Conditions d&apos;utilisation</h1>
          <p className="text-muted-foreground text-lg">Dernière mise à jour : 1er janvier 2026</p>
        </div>

        <hr className="border-border" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">1. Objet</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme de gestion des partenaires de Capgemini Tunisie (ci-après &quot;la Plateforme&quot;). En accédant à la Plateforme, l&apos;utilisateur accepte sans réserve l&apos;ensemble des présentes CGU.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">2. Accès à la plateforme</h2>
          <p className="text-muted-foreground leading-relaxed">
            L&apos;accès à la Plateforme est réservé aux utilisateurs dûment autorisés : employés de Capgemini Tunisie disposant d&apos;un compte actif, et partenaires dont la demande d&apos;adhésion a été approuvée par l&apos;équipe Capgemini. Tout accès non autorisé est strictement interdit et pourra faire l&apos;objet de poursuites judiciaires.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">3. Comptes utilisateurs</h2>
          <p className="text-muted-foreground leading-relaxed">
            L&apos;utilisateur est responsable de la confidentialité de ses identifiants de connexion. Il s&apos;engage à ne pas partager son compte avec des tiers et à notifier immédiatement Capgemini Tunisie en cas d&apos;utilisation non autorisée de son compte à l&apos;adresse : <span className="text-primary font-medium">support.partenaires@capgemini.com</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Capgemini Tunisie se réserve le droit de suspendre ou de supprimer tout compte en cas de violation des présentes CGU, de comportement frauduleux, ou d&apos;inactivité prolongée (supérieure à 12 mois).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4. Utilisation autorisée</h2>
          <p className="text-muted-foreground leading-relaxed">L&apos;utilisateur s&apos;engage à utiliser la Plateforme exclusivement dans le cadre de sa relation partenariale avec Capgemini Tunisie et à :</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li>Fournir des informations exactes et à jour sur son organisation et ses activités</li>
            <li>Respecter les règles de confidentialité relatives aux informations auxquelles il accède via la Plateforme</li>
            <li>Utiliser les données présentes sur la Plateforme uniquement dans le cadre des missions partenariales autorisées</li>
            <li>Respecter l&apos;ensemble des lois et réglementations applicables en Tunisie et dans son pays d&apos;établissement</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">5. Utilisations interdites</h2>
          <p className="text-muted-foreground leading-relaxed">Il est formellement interdit à l&apos;utilisateur de :</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li>Tenter de contourner les mécanismes d&apos;authentification ou d&apos;accéder à des données non autorisées</li>
            <li>Copier, redistribuer ou revendre les données présentes sur la Plateforme à des tiers</li>
            <li>Introduire des virus, malwares ou tout code malveillant dans la Plateforme</li>
            <li>Utiliser des scripts automatisés ou bots pour interagir avec la Plateforme</li>
            <li>Usurper l&apos;identité d&apos;un autre utilisateur ou d&apos;un représentant de Capgemini</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">6. Propriété intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            La Plateforme, son code source, son design, ses logos, ses marques et l&apos;ensemble de son contenu sont la propriété exclusive de Capgemini SE et de ses filiales. Toute reproduction, représentation, modification ou exploitation non autorisée de ces éléments est strictement interdite.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Les partenaires conservent la propriété de leurs propres données et documents déposés sur la Plateforme. En les déposant, ils accordent à Capgemini Tunisie une licence non exclusive pour les utiliser dans le cadre de la relation partenariale.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">7. Confidentialité des données partenariales</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les informations échangées via la Plateforme dans le cadre du partenariat (KPIs, offres, contrats, informations commerciales) sont strictement confidentielles. L&apos;utilisateur s&apos;engage à ne pas les divulguer à des tiers sans autorisation écrite préalable de Capgemini Tunisie.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">8. Disponibilité du service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Capgemini Tunisie s&apos;efforce d&apos;assurer la disponibilité de la Plateforme 24h/24 et 7j/7. Toutefois, des interruptions pour maintenance, mises à jour, ou pour des raisons indépendantes de notre volonté (panne réseau, force majeure) peuvent survenir. Capgemini Tunisie ne saurait être tenu responsable des conséquences de ces interruptions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">9. Limitation de responsabilité</h2>
          <p className="text-muted-foreground leading-relaxed">
            Capgemini Tunisie décline toute responsabilité pour les dommages indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser la Plateforme. La responsabilité de Capgemini Tunisie est en tout état de cause limitée au montant des prestations facturées au partenaire au cours des 12 derniers mois précédant le dommage.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">10. Modifications des CGU</h2>
          <p className="text-muted-foreground leading-relaxed">
            Capgemini Tunisie se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront notifiés de toute modification substantielle par email. La poursuite de l&apos;utilisation de la Plateforme après notification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">11. Droit applicable & juridiction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes CGU sont soumises au droit tunisien. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents de Tunis seront seuls compétents. Capgemini Tunisie favorise en priorité une résolution par médiation avant tout recours judiciaire.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Pour toute question relative aux présentes CGU : <span className="text-primary font-medium">legal.tn@capgemini.com</span>
            <br />
            Capgemini Tunisie — Parc Technologique El Ghazala, Tunis, Tunisie
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
