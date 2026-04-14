import Link from "next/link"
import { CapgeminiLogo } from "@/frontend/components/icons"
import { Footer } from "@/frontend/components/footer"

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-foreground">Politique de confidentialité</h1>
          <p className="text-muted-foreground text-lg">Dernière mise à jour : 1er janvier 2026</p>
        </div>

        <hr className="border-border" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">1. Responsable du traitement</h2>
          <p className="text-muted-foreground leading-relaxed">
            Capgemini Tunisie, société immatriculée en Tunisie, dont le siège social est situé au Parc Technologique El Ghazala, Tunis, est le responsable du traitement des données personnelles collectées via cette plateforme. Pour toute question relative à vos données, contactez-nous à : <span className="text-primary font-medium">privacy.tn@capgemini.com</span>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">2. Données collectées</h2>
          <p className="text-muted-foreground leading-relaxed">
            Dans le cadre de l&apos;utilisation de la plateforme de gestion des partenaires, nous collectons les données suivantes :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li><strong>Données d&apos;identification</strong> : nom, prénom, adresse email professionnelle, numéro de téléphone</li>
            <li><strong>Données d&apos;organisation</strong> : raison sociale, numéro fiscal, adresse postale, secteur d&apos;activité</li>
            <li><strong>Données de connexion</strong> : adresse IP, logs d&apos;accès, cookies de session (httpOnly, sécurisés)</li>
            <li><strong>Données de partenariat</strong> : documents contractuels, historique des échanges, KPIs partenaires</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">3. Finalités du traitement</h2>
          <p className="text-muted-foreground leading-relaxed">Vos données sont traitées aux fins suivantes :</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li>Gestion des comptes partenaires et de l&apos;authentification sécurisée</li>
            <li>Suivi des relations partenariales, des contrats et des KPIs</li>
            <li>Communication relative aux projets, événements et opportunités commerciales</li>
            <li>Conformité aux obligations légales et réglementaires</li>
            <li>Amélioration de la plateforme sur la base d&apos;analyses statistiques anonymisées</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4. Base légale du traitement</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le traitement de vos données repose sur les bases légales suivantes, conformément à la loi tunisienne n° 2004-63 du 27 juillet 2004 sur la protection des données personnelles et aux principes du RGPD européen :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li><strong>Exécution contractuelle</strong> : pour les données nécessaires à la gestion du partenariat</li>
            <li><strong>Consentement</strong> : pour les communications marketing optionnelles</li>
            <li><strong>Intérêt légitime</strong> : pour la sécurité de la plateforme et la prévention des fraudes</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">5. Conservation des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les données personnelles sont conservées pendant la durée de la relation partenariale, augmentée d&apos;un délai de <strong>5 ans</strong> à titre d&apos;archivage légal. Les données de connexion (logs) sont conservées <strong>12 mois</strong>. Les données relatives aux candidatures de partenariat refusées sont supprimées après <strong>2 ans</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">6. Partage des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vos données peuvent être partagées avec :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li>Les entités du groupe Capgemini, dans le cadre de la gestion globale des partenariats</li>
            <li>Les prestataires techniques hébergeant la plateforme, soumis à des contrats de sous-traitance conformes</li>
            <li>Les autorités compétentes, en cas d&apos;obligation légale</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Aucune donnée n&apos;est vendue ou cédée à des tiers à des fins commerciales.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">7. Sécurité des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            Capgemini Tunisie met en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données : chiffrement des mots de passe (bcrypt), sessions sécurisées (JWT httpOnly), accès restreint par rôle (RBAC), et audit des accès. La plateforme est hébergée dans un environnement sécurisé conforme aux standards de sécurité du groupe Capgemini.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">8. Vos droits</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conformément à la réglementation applicable, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données (sous conditions)</li>
            <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement à des fins marketing</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Pour exercer ces droits, contactez-nous à <span className="text-primary font-medium">privacy.tn@capgemini.com</span> en joignant une copie de votre pièce d&apos;identité.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            La plateforme utilise uniquement des cookies strictement nécessaires à son fonctionnement : cookie de session d&apos;authentification (<code className="bg-muted px-1 rounded text-sm">session_token</code>) de type httpOnly et Secure, sans expiration prolongée (7 jours). Aucun cookie tiers publicitaire n&apos;est utilisé.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">10. Contact & réclamations</h2>
          <p className="text-muted-foreground leading-relaxed">
            Pour toute réclamation, vous pouvez également vous adresser à l&apos;Instance Nationale de Protection des Données Personnelles (INPDP) en Tunisie. Notre délégué à la protection des données (DPD) est joignable à : <span className="text-primary font-medium">privacy.tn@capgemini.com</span>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
