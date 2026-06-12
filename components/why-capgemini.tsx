"use client"

import { type ComponentProps } from "react"
import { motion } from "framer-motion"
import MarqueeText from "@/components/ui/marquee-text"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  HierarchyIcon,
  ArtificialIntelligence01Icon,
  Location01Icon,
  ChampionIcon,
  ChartLineData01Icon,
  GlobalIcon
} from "@hugeicons/core-free-icons"

type FeatureCardProps = {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  title: string
  description: string
  index: number
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
      className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/35"
    >
      <div className="flex h-full flex-col">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HugeiconsIcon icon={icon} className="size-6" />
        </div>
        <h3 className="mb-4 text-xl font-semibold text-foreground">{title}</h3>
        <p className="flex-grow text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}

const values = [
  {
    icon: GlobalIcon,
    title: "Écosystème mondial de partenaires",
    description: "Rejoignez un réseau de partenaires technologiques de premier plan et bénéficiez d'une visibilité internationale.",
  },
  {
    icon: HierarchyIcon,
    title: "Expertise sectorielle profonde",
    description: "Capgemini opère dans l'industrie, la finance, le retail, le secteur public et les télécoms. Vos solutions atteignent des clients à fort enjeu digital.",
  },
  {
    icon: ArtificialIntelligence01Icon,
    title: "Transformation digitale & IA",
    description: "Accédez à des projets à haute valeur ajoutée : cloud, data, intelligence artificielle, ingénierie logicielle et cybersécurité.",
  },
  {
    icon: Location01Icon,
    title: "Ancrage local, portée globale",
    description: "Capgemini Tunisie combine l'expertise locale avec les standards du groupe mondial pour des collaborations durables.",
  },
  {
    icon: ChampionIcon,
    title: "Éthique & responsabilité",
    description: "Partenaire de confiance, Capgemini valorise la diversité, l'inclusion, la durabilité et les engagements responsables.",
  },
  {
    icon: ChartLineData01Icon,
    title: "Croissance conjointe",
    description: "Accédez à un pipeline d'opportunités réelles, un co-développement commercial et une relation structurée sur le long terme.",
  }
]

export function WhyCapgemini() {
  return (
    <section id="why-capgemini" className="py-24 bg-background overflow-hidden">
      {/* Marquee header - ligne 1 : titre (gauche vers droite) */}
      <MarqueeText
        baseVelocity={-0.5}
        scrollDependent
        clasname="font-semibold text-foreground"
      >
        {"Pourquoi Capgemini ?    Pourquoi Capgemini ?   "}
      </MarqueeText>

      {/* Marquee header - ligne 2 : sous-titre (droite vers gauche) */}
      <MarqueeText
        baseVelocity={0.5}
        scrollDependent
        delay={200}
        clasname="font-semibold text-primary"
      >
        {"  Collaborez avec un leader mondial pour accélérer votre croissance et celle de vos clients.   "}
      </MarqueeText>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => (
            <FeatureCard
              key={index}
              index={index}
              icon={value.icon}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
