"use client"

import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  HierarchyIcon, 
  ArtificialIntelligence01Icon, 
  Location01Icon, 
  ChampionIcon, 
  ChartLineData01Icon,
  GlobalIcon
} from "@hugeicons/core-free-icons"
import { Button } from "@/frontend/components/ui/button"
import Link from "next/link"

const stats = [
  { label: "de l'expertise mondiale en transformation digitale", value: "60 ans" },
  { label: "collaborateurs dans le monde", value: "340 000+" },
  { label: "des 200 plus grandes entreprises nous font confiance", value: "85%" },
  { label: "nommé parmi les entreprises les plus éthiques", value: "13x" },
]

const values = [
  {
    icon: GlobalIcon,
    title: "Écosystème mondial de partenaires",
    description: "Rejoignez un réseau de partenaires technologiques de premier plan (Microsoft, SAP, AWS, Google Cloud, Oracle, Salesforce) et bénéficiez d'une visibilité internationale.",
    color: "blue"
  },
  {
    icon: HierarchyIcon,
    title: "Expertise sectorielle profonde",
    description: "Capgemini opère dans l'industrie, la finance, le retail, le secteur public et les télécoms. Vos solutions atteignent des clients dans des secteurs à fort enjeu digital.",
    color: "indigo"
  },
  {
    icon: ArtificialIntelligence01Icon,
    title: "Transformation digitale & IA",
    description: "Accédez à des projets à haute valeur ajoutée : cloud, data, intelligence artificielle, ingénierie logicielle et cybersécurité — les piliers de la transformation moderne.",
    color: "violet"
  },
  {
    icon: Location01Icon,
    title: "Ancrage local, portée globale",
    description: "Capgemini Tunisie est un hub régional qui combine l'expertise locale avec les standards du groupe mondial, pour des collaborations durables et à fort impact.",
    color: "cyan"
  },
  {
    icon: ChampionIcon,
    title: "Éthique & responsabilité",
    description: "Capgemini est engagé dans 11 Objectifs de Développement Durable de l'ONU. Partenaire de confiance, nous valorisons la diversité, l'inclusion et la durabilité.",
    color: "blue"
  },
  {
    icon: ChartLineData01Icon,
    title: "Croissance conjointe",
    description: "Un partenariat avec Capgemini Tunisie, c'est un accès à un pipeline d'opportunités réelles, un co-développement commercial et une relation structurée sur le long terme.",
    color: "indigo"
  }
]

export function WhyCapgemini() {
  return (
    <section id="why-capgemini" className="py-24 bg-background">
      <div className="container mx-auto px-4 space-y-24">
        
        {/* Bloc 1 — Chiffres clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center justify-center"
            >
              <h3 className="text-3xl font-bold text-primary mb-2">{stat.value}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bloc 2 — Valeur ajoutée */}
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pourquoi devenir partenaire Capgemini ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Collaborez avec un leader mondial pour accélérer votre croissance et celle de vos clients.
            </p>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/50 transition-all flex flex-col h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <HugeiconsIcon icon={value.icon} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
