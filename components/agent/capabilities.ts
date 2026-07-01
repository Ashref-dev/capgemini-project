import {
  AiBrain01Icon,
  AnalyticsUpIcon,
  Briefcase01Icon,
  ChartIncreaseIcon,
  MortarboardIcon,
  PresentationBarChart01Icon,
  SparklesIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"

import type { PromptStarter, SlashCommand } from "./types"

type StarterIcon = typeof ChartIncreaseIcon

export type CapabilityStarter = PromptStarter & {
  icon: StarterIcon
  featured?: boolean
}

export const CAPABILITIES: CapabilityStarter[] = [
  {
    id: "langsmith",
    command: "/langsmith",
    icon: AiBrain01Icon,
    label: "Analyse LangSmith",
    description: "Rapport exécutif du partenaire fournisseur LangSmith — scoring, churn, RAG, PDF.",
    featured: true,
    prompt:
      "Génère le rapport exécutif stratégique du partenaire LangSmith (fournisseur technologique) pour Capgemini Tunisia. Déclare d'abord ta méthodologie et ton plan d'analyse, puis structure le rapport en sections claires : (1) score les 5 dimensions stratégiques de LangSmith — graphique en barres et tableau détaillé ; (2) répartition de son activité (événements, réunions, projets) en camembert ; (3) évolution trimestrielle des KPIs (interactions, revenus, satisfaction) en courbes ; (4) évalue le risque de churn avec signaux d'alerte et plan de rétention sur 30 jours ; (5) analyse la santé de ses projets ; (6) cite les obligations contractuelles et les conditions de renouvellement depuis nos documents. Pour chaque section, rédige l'analyse puis insère juste après la visualisation correspondante (au moins un graphique en barres, un camembert, une courbe et un tableau, chacun dans sa propre section — n'affiche jamais tous les graphiques en bloc au début). Termine par un rapport PDF exportable et une section ## Sources avec liens profonds vers les fiches concernées.",
  },
  {
    id: "polytech",
    command: "/polytech",
    icon: MortarboardIcon,
    label: "Analyse Polytech",
    description: "Rapport exécutif du partenaire universitaire Polytech Intl — pipeline CDI, RAG, PDF.",
    featured: true,
    prompt:
      "Génère le rapport exécutif stratégique du partenaire universitaire Polytechnique Internationale (Polytech Intl) pour Capgemini Tunisia. Déclare d'abord ta méthodologie et ton plan d'analyse, puis structure le rapport en sections claires : (1) score les 5 dimensions stratégiques de Polytech Intl — graphique en barres et tableau détaillé ; (2) répartition de l'activité (événements, réunions, recrutements) en camembert ; (3) évolution trimestrielle des KPIs en courbes ; (4) analyse le pipeline de recrutement (stages, alternances, conversions CDI) avec un plan de rétention des talents ; (5) évalue le risque de churn du partenariat académique ; (6) cite les obligations de l'accord-cadre depuis nos documents. Pour chaque section, rédige l'analyse puis insère juste après la visualisation correspondante (au moins un graphique en barres, un camembert, une courbe et un tableau, chacun dans sa propre section — n'affiche jamais tous les graphiques en bloc au début). Termine par un rapport PDF exportable et une section ## Sources avec liens profonds.",
  },
  {
    id: "report",
    command: "/rapport",
    icon: PresentationBarChart01Icon,
    label: "Rapport exécutif complet",
    description: "Portfolio + scoring + churn + graphiques + rapport PDF exportable.",
    prompt:
      "Génère le rapport exécutif complet du portefeuille partenaires Capgemini Tunisia, structuré en sections claires : répartition par catégorie (camembert), top 5 partenaires par score stratégique (tableau + graphique en barres), évolution des indicateurs clés (courbes), top 3 à risque de churn avec plan de rétention, indicateurs budgétaires par catégorie, et recommandations stratégiques prioritaires. Pour chaque section, rédige l'analyse puis insère juste après la visualisation correspondante (au moins un graphique en barres, un camembert, une courbe et un tableau, chacun dans sa propre section — jamais tous les graphiques en bloc au début). Finalise avec un rapport PDF exportable.",
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

const PILL_IDS = ["langsmith", "polytech", "report", "churn", "health", "rag"] as const

export const SUGGESTION_PILLS: CapabilityStarter[] = PILL_IDS.map(
  (id) => CAPABILITIES.find((capability) => capability.id === id),
).filter((capability): capability is CapabilityStarter => capability !== undefined)
