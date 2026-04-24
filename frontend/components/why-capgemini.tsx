"use client"

import { type ComponentProps } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import MarqueeText from "@/frontend/components/ui/marquee-text"
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
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(springY, [-0.5, 0.5], ["10.5deg", "-10.5deg"])
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-10.5deg", "10.5deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const { width, height, left, top } = rect
    mouseX.set((e.clientX - left) / width - 0.5)
    mouseY.set((e.clientY - top) / height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      style={{ perspective: "1000px" }}
      className="h-full"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="h-full rounded-2xl border border-[#0070AD]/20 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <div
          style={{
            transform: "translateZ(30px)",
            transformStyle: "preserve-3d",
          }}
          className="flex h-full flex-col"
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0070AD]/10 dark:bg-[#12ABDB]/10">
            <HugeiconsIcon icon={icon} className="h-6 w-6 text-[#0070AD] dark:text-[#12ABDB]" />
          </div>
          <h3 className="mb-4 text-xl font-semibold text-[#001A3A] dark:text-white">{title}</h3>
          <p className="flex-grow text-sm leading-relaxed text-[#001A3A]/60 dark:text-white/70">{description}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

const values = [
  {
    icon: GlobalIcon,
    title: "Ecosysteme mondial de partenaires",
    description: "Rejoignez un reseau de partenaires technologiques de premier plan (Microsoft, SAP, AWS, Google Cloud, Oracle, Salesforce) et beneficiez d'une visibilite internationale.",
    color: "blue"
  },
  {
    icon: HierarchyIcon,
    title: "Expertise sectorielle profonde",
    description: "Capgemini opere dans l'industrie, la finance, le retail, le secteur public et les telecoms. Vos solutions atteignent des clients dans des secteurs a fort enjeu digital.",
    color: "indigo"
  },
  {
    icon: ArtificialIntelligence01Icon,
    title: "Transformation digitale & IA",
    description: "Acceez a des projets a haute valeur ajoutee : cloud, data, intelligence artificielle, ingenierie logicielle et cybersecurite - les piliers de la transformation moderne.",
    color: "violet"
  },
  {
    icon: Location01Icon,
    title: "Ancrage local, portee globale",
    description: "Capgemini Tunisie est un hub regional qui combine l'expertise locale avec les standards du groupe mondial, pour des collaborations durables et a fort impact.",
    color: "cyan"
  },
  {
    icon: ChampionIcon,
    title: "Ethique & responsabilite",
    description: "Capgemini est engage dans 11 Objectifs de Developpement Durable de l'ONU. Partenaire de confiance, nous valorisons la diversite, l'inclusion et la durabilite.",
    color: "blue"
  },
  {
    icon: ChartLineData01Icon,
    title: "Croissance conjointe",
    description: "Un partenariat avec Capgemini Tunisie, c'est un acces a un pipeline d'opportunites reelles, un co-developpement commercial et une relation structuree sur le long terme.",
    color: "indigo"
  }
]

export function WhyCapgemini() {
  return (
    <section id="why-capgemini" className="py-24 bg-background overflow-hidden">
      {/* Marquee header - ligne 1 : titre (gauche vers droite) */}
      <MarqueeText
        baseVelocity={-0.5}
        scrollDependent
        clasname="font-bold text-[#001A3A] dark:text-white/90"
      >
        {"Pourquoi Capgemini ?    Why Capgemini ?   "}
      </MarqueeText>

      {/* Marquee header - ligne 2 : sous-titre (droite vers gauche) */}
      <MarqueeText
        baseVelocity={0.5}
        scrollDependent
        delay={200}
        clasname="font-bold text-[#0070AD] dark:text-[#12ABDB]/80"
      >
        {"  Collaborez avec un leader mondial pour accelerer votre croissance et celle de vos clients.   "}
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
