"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiChat02Icon,
  AnalyticsUpIcon,
  ChartAverageIcon,
  MortarboardIcon,
  PlayCircleIcon,
  PresentationBarChart01Icon,
  Target01Icon,
  UserGroupIcon,
  WorkflowCircle01Icon,
} from "@hugeicons/core-free-icons"
import { motion, type Variants } from "framer-motion"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DemoStats {
  partners: number
  projects: number
  recruits: number
  aiTools: number
}

interface BIStatsResponse {
  projectsSummary?: {
    total_projects?: string
  }
  recruitmentSummary?: {
    total_students?: string
  }
}

interface PartnersResponse {
  partners?: unknown[]
}

const TOUR_EVENT = "intelliconnect:start-tour"
const DEFAULT_STATS: DemoStats = {
  partners: 178,
  projects: 35,
  recruits: 50,
  aiTools: 13,
}

const statCards = [
  { label: "Partners", key: "partners" },
  { label: "Projects", key: "projects" },
  { label: "Recruits", key: "recruits" },
  { label: "AI Tools", key: "aiTools" },
] as const

const featureCards = [
  {
    title: "Partner Management",
    description: "Browse active accounts, update statuses, and move quickly into relationship workflows.",
    href: "/dashboard/partners",
    icon: UserGroupIcon,
  },
  {
    title: "BI Analytics",
    description: "Track category mix, revenue, satisfaction, and operational KPIs from the warehouse.",
    href: "/dashboard/bi",
    icon: AnalyticsUpIcon,
  },
  {
    title: "AI Agent",
    description: "Ask natural-language questions and get scoring, recommendations, and churn insights instantly.",
    href: "/dashboard/agent",
    icon: AiChat02Icon,
  },
  {
    title: "HR Management",
    description: "Monitor employees, recruiting flows, and workforce signals connected to partnerships.",
    href: "/dashboard/hr/employees",
    icon: MortarboardIcon,
  },
  {
    title: "Scoring Engine",
    description: "Review how the platform evaluates partner fit, risk, and opportunity with AI assistance.",
    href: "#scoring-engine",
    icon: Target01Icon,
  },
  {
    title: "Report Generation",
    description: "See how partnership proposals and executive-ready summaries are produced in seconds.",
    href: "#report-generation",
    icon: PresentationBarChart01Icon,
  },
] as const

const sectionCards = [
  {
    id: "scoring-engine",
    title: "Scoring Engine",
    description:
      "The scoring engine combines compatibility criteria, partnership history, and operational context to prioritize the most promising relationships.",
    bullets: [
      "Scores applications in seconds instead of manual review cycles.",
      "Surfaces fit, risk, and recommendation signals for decision support.",
      "Helps teams focus attention where partnership value is highest.",
    ],
    icon: ChartAverageIcon,
  },
  {
    id: "report-generation",
    title: "Report Generation",
    description:
      "Automated reporting packages operational facts, BI insights, and AI-generated recommendations into stakeholder-ready outputs.",
    bullets: [
      "Turns scattered updates into structured proposals and summaries.",
      "Reduces the time required to prepare executive reporting.",
      "Keeps language, structure, and recommendations consistent across teams.",
    ],
    icon: WorkflowCircle01Icon,
  },
] as const

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
}

export default function DemoPage() {
  const [stats, setStats] = React.useState<DemoStats>(DEFAULT_STATS)
  const [statsSource, setStatsSource] = React.useState("Using live partner and BI data where available. AI tools reflects current platform configuration.")

  React.useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      try {
        const [partnersResult, biResult] = await Promise.allSettled([
          fetch("/api/partners"),
          fetch("/api/bi"),
        ])

        const nextStats = { ...DEFAULT_STATS }
        let loadedLiveStats = false

        if (partnersResult.status === "fulfilled" && partnersResult.value.ok) {
          const partnersData = (await partnersResult.value.json()) as PartnersResponse

          if (Array.isArray(partnersData.partners)) {
            nextStats.partners = partnersData.partners.length
            loadedLiveStats = true
          }
        }

        if (biResult.status === "fulfilled" && biResult.value.ok) {
          const biData = (await biResult.value.json()) as BIStatsResponse
          const projects = Number(biData.projectsSummary?.total_projects ?? DEFAULT_STATS.projects)
          const recruits = Number(biData.recruitmentSummary?.total_students ?? DEFAULT_STATS.recruits)

          nextStats.projects = Number.isFinite(projects) ? projects : DEFAULT_STATS.projects
          nextStats.recruits = Number.isFinite(recruits) ? recruits : DEFAULT_STATS.recruits
          loadedLiveStats = true
        }

        if (!isMounted) {
          return
        }

        setStats(nextStats)
        setStatsSource(
          loadedLiveStats
            ? "Partners, projects, and recruit totals are loaded from the existing dashboard APIs. AI tools remains a platform configuration count."
            : "Live data was unavailable, so the page is showing the documented platform totals."
        )
      } catch {
        if (!isMounted) {
          return
        }

        setStatsSource("Live data was unavailable, so the page is showing the documented platform totals.")
      }
    }

    void loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.section variants={itemVariants}>
        <Card className="border-primary/15 bg-gradient-to-br from-primary/12 via-background to-background shadow-sm">
          <CardHeader className="gap-4 border-b border-border/70 pb-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <HugeiconsIcon icon={PlayCircleIcon} className="h-3.5 w-3.5" />
                  Interactive walkthrough
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    IntelliConnect Platform Tour
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-base leading-7">
                    Launch a guided tour across partner operations, BI analytics, and the AI workspace to understand how the platform shortens research and reporting cycles.
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                className="h-11 cursor-pointer bg-blue-600 px-5 text-white hover:bg-blue-700"
                onClick={() => {
                  window.dispatchEvent(new Event(TOUR_EVENT))
                }}
              >
                <HugeiconsIcon icon={PlayCircleIcon} className="mr-2 h-4 w-4" />
                Start Tour
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">{statsSource}</p>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {statCards.map((stat) => (
                <motion.div key={stat.key} variants={itemVariants}>
                  <Card className="border-border/70 bg-background/80 py-0 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">
                        {stats[stat.key].toLocaleString("en-US")}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section variants={itemVariants} className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Explore key platform areas</h2>
          <p className="text-sm text-muted-foreground">
            Use the quick links below to jump directly into the operational modules highlighted by the tour.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Link href={feature.href} className="block h-full cursor-pointer">
                <Card className="h-full border-border/70 bg-card/90 transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md">
                  <CardHeader className="space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <HugeiconsIcon icon={feature.icon} className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription className="leading-6">{feature.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {sectionCards.map((section) => (
          <Card key={section.id} id={section.id} className="scroll-mt-24 border-border/70 bg-card/90">
            <CardHeader className="gap-3 border-b border-border/70">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HugeiconsIcon icon={section.icon} className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <CardTitle>{section.title}</CardTitle>
                <CardDescription className="leading-6">{section.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </motion.section>
    </motion.div>
  )
}
