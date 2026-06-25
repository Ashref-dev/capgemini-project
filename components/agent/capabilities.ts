import {
  AnalyticsUpIcon,
  Briefcase01Icon,
  ChartIncreaseIcon,
  PresentationBarChart01Icon,
  SparklesIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"

import type { PromptStarter, SlashCommand } from "./types"

type StarterIcon = typeof ChartIncreaseIcon

export type CapabilityStarter = PromptStarter & {
  icon: StarterIcon
}

export const CAPABILITIES: CapabilityStarter[] = [
  {
    id: "report",
    command: "/rapport",
    icon: PresentationBarChart01Icon,
    label: "Rapport exécutif complet",
    description: "Portfolio + scoring + churn + graphiques + rapport PDF exportable.",
    prompt:
      "Génère le rapport exécutif complet du portefeuille partenaires Capgemini Tunisia : répartition par catégorie (camembert), top 5 partenaires par score stratégique (tableau + graphique en barres), top 3 à risque de churn avec plan de rétention, indicateurs budgétaires par catégorie, et recommandations stratégiques prioritaires. Finalise avec un rapport PDF exportable.",
  },
  {
    id: "score",
    command: "/score",
    icon: ChartIncreaseIcon,
    label: "Scoring comparatif",
    description: "Compare BIAT, Microsoft Tunisie et ESPRIT sur 5 dimensions avec graphiques.",
    prompt:
      "Compare et score les partenaires BIAT, Microsoft Tunisie et ESPRIT sur les 5 dimensions stratégiques. Affiche un tableau comparatif détaillé, un graphique en barres des scores, et dis-moi lequel renouveler en priorité avec justification.",
  },
  {
    id: "churn",
    command: "/churn",
    icon: AnalyticsUpIcon,
    label: "Risque de churn",
    description: "Top 3 partenaires à risque avec signaux d'alerte et plan de rétention.",
    prompt:
      "Identifie les 3 partenaires les plus à risque de churn. Pour chacun : score de risque, 3 signaux d'alerte principaux, et plan de rétention concret sur 30 jours. Affiche un graphique des niveaux de risque et un tableau récapitulatif.",
  },
  {
    id: "health",
    command: "/health",
    icon: Briefcase01Icon,
    label: "Santé des projets",
    description: "Projets Rouge/Orange/Vert avec tableau, graphique et actions correctives.",
    prompt:
      "Analyse la santé de tous les projets actifs. Classe-les Rouge / Orange / Vert, affiche un tableau avec budget, avancement et retard, un graphique de distribution des statuts, et propose 3 actions correctives prioritaires pour les projets en rouge.",
  },
  {
    id: "staffing",
    command: "/staffing",
    icon: UserMultiple02Icon,
    label: "Staffing intelligent",
    description: "Top 5 profils Capgemini pour le projet 1 avec tableau d'adéquation.",
    prompt:
      "Pour le projet 1, identifie les 5 meilleurs profils internes Capgemini pour le staffing. Justifie chaque recommandation avec compétences clés, taux d'adéquation et disponibilité. Affiche un tableau comparatif et un graphique d'adéquation.",
  },
  {
    id: "rag",
    command: "/rag",
    icon: SparklesIcon,
    label: "Recherche documentaire",
    description: "Conditions contractuelles Microsoft Tunisie citées depuis vos documents.",
    prompt:
      "Cherche dans nos documents partenaires : quelles sont les obligations contractuelles et les conditions de renouvellement du partenariat Microsoft Tunisie ? Cite les extraits sources exacts et affiche un tableau récapitulatif des clauses clés.",
  },
]

export const SLASH_COMMANDS: SlashCommand[] = CAPABILITIES.map((capability) => ({
  trigger: capability.command,
  label: capability.label,
  description: capability.description,
  template: capability.prompt,
}))
