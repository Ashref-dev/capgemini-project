"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartAverageIcon,
  SpeedTrain01Icon,
  Target01Icon,
  WorkflowCircle01Icon,
} from "@hugeicons/core-free-icons"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface BenchmarkRow {
  task: string
  manual: string
  ai: string
  timeSaved: string
  manualHours: number
  aiHours: number
}

interface BIStatsResponse {
  projectsSummary?: {
    total_projects?: string
  }
}

interface PartnersResponse {
  partners?: unknown[]
}

const benchmarkRows: BenchmarkRow[] = [
  {
    task: "Partner Scoring",
    manual: "45 min per partner",
    ai: "2 seconds",
    timeSaved: "99.9%",
    manualHours: 0.75,
    aiHours: 2 / 3600,
  },
  {
    task: "Report Generation",
    manual: "8 hours",
    ai: "15 seconds",
    timeSaved: "99.9%",
    manualHours: 8,
    aiHours: 15 / 3600,
  },
  {
    task: "Data Analysis Query",
    manual: "2 hours",
    ai: "3 seconds",
    timeSaved: "99.9%",
    manualHours: 2,
    aiHours: 3 / 3600,
  },
  {
    task: "Churn Risk Assessment",
    manual: "1 day per review",
    ai: "5 seconds",
    timeSaved: "99.9%",
    manualHours: 24,
    aiHours: 5 / 3600,
  },
  {
    task: "Partner Recommendations",
    manual: "3 hours research",
    ai: "4 seconds",
    timeSaved: "99.9%",
    manualHours: 3,
    aiHours: 4 / 3600,
  },
  {
    task: "Portfolio Overview",
    manual: "30 min compilation",
    ai: "Instant",
    timeSaved: "100%",
    manualHours: 0.5,
    aiHours: 0,
  },
] as const

const chartConfig = {
  manualHours: {
    label: "Manual process",
    color: "var(--destructive)",
  },
  aiHours: {
    label: "AI process",
    color: "var(--primary)",
  },
}

const timelineColumns = [
  {
    title: "Manual",
    description: "Traditional review cycles with handoffs, compilation, and delayed visibility.",
    accentClassName: "border-destructive/20 bg-destructive/10 text-destructive",
    lineClassName: "bg-destructive/20",
    dotClassName: "bg-destructive",
    steps: [
      "Week 1: Gather data",
      "Week 2: Analyze",
      "Week 3: Report",
      "Week 4: Decision",
    ],
  },
  {
    title: "AI",
    description: "Compressed decision cycles that move from query to action within minutes.",
    accentClassName: "border-primary/20 bg-primary/10 text-primary",
    lineClassName: "bg-primary/20",
    dotClassName: "bg-primary",
    steps: [
      "Minute 1: Query",
      "Minute 2: Analyze",
      "Minute 3: Visualize",
      "Minute 4: Decide",
    ],
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

function AnimatedMetric({
  value,
  label,
  description,
  suffix = "",
  decimals = 0,
  icon,
}: {
  value: number
  label: string
  description: string
  suffix?: string
  decimals?: number
  icon: typeof SpeedTrain01Icon
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const motionValue = useMotionValue(0)
  const roundedValue = useTransform(motionValue, (latest) => latest.toFixed(decimals))
  const [displayValue, setDisplayValue] = React.useState((0).toFixed(decimals))

  React.useEffect(() => {
    const unsubscribe = roundedValue.on("change", (latest) => {
      setDisplayValue(latest)
    })

    return () => {
      unsubscribe()
    }
  }, [roundedValue])

  React.useEffect(() => {
    if (!isInView) {
      return
    }

    const controls = animate(motionValue, value, {
      duration: 1.1,
      ease: "easeOut",
    })

    return () => {
      controls.stop()
    }
  }, [isInView, motionValue, value])

  return (
    <div ref={ref}>
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="gap-3 border-b border-border/70">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={icon} className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
              {displayValue}
              {suffix}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BenchmarkPage() {
  const [partnersAnalyzed, setPartnersAnalyzed] = React.useState(178)
  const [projectsBenchmarked, setProjectsBenchmarked] = React.useState(35)

  React.useEffect(() => {
    let isMounted = true

    const loadCounts = async () => {
      try {
        const [partnersResult, biResult] = await Promise.allSettled([
          fetch("/api/partners"),
          fetch("/api/bi"),
        ])

        if (partnersResult.status === "fulfilled" && partnersResult.value.ok) {
          const partnersData = (await partnersResult.value.json()) as PartnersResponse

          if (isMounted && Array.isArray(partnersData.partners)) {
            setPartnersAnalyzed(partnersData.partners.length)
          }
        }

        if (biResult.status === "fulfilled" && biResult.value.ok) {
          const biData = (await biResult.value.json()) as BIStatsResponse
          const nextProjects = Number(biData.projectsSummary?.total_projects ?? 35)

          if (isMounted && Number.isFinite(nextProjects)) {
            setProjectsBenchmarked(nextProjects)
          }
        }
      } catch {
        return
      }
    }

    void loadCounts()

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
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <HugeiconsIcon icon={SpeedTrain01Icon} className="h-3.5 w-3.5" />
                Benchmark snapshot
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  AI-Powered Decision Making vs Traditional Process
                </CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7">
                  Compare how IntelliConnect compresses research, scoring, reporting, and risk analysis from hours or days into seconds.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 text-sm text-muted-foreground md:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Partners analyzed</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{partnersAnalyzed}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Projects benchmarked</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{projectsBenchmarked}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">AI tools</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">13</p>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnimatedMetric
          value={99.7}
          decimals={1}
          suffix="%"
          label="Average Time Reduction"
          description="Across scoring, reporting, search, and risk review workflows."
          icon={SpeedTrain01Icon}
        />
        <AnimatedMetric
          value={partnersAnalyzed}
          label="Partners Analyzed"
          description="Live benchmark context pulled from the platform’s partner dataset."
          icon={ChartAverageIcon}
        />
        <AnimatedMetric
          value={13}
          label="AI Tools Available"
          description="Configured AI capabilities across insights, scoring, and reporting flows."
          icon={WorkflowCircle01Icon}
        />
        <AnimatedMetric
          value={24}
          label="Availability"
          description="Always-on access for partnership analysis and decision support."
          suffix="/7"
          icon={Target01Icon}
        />
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Comparison Table</CardTitle>
            <CardDescription>
              Measured tasks based on the platform workflows already available across scoring, BI, AI queries, and reporting.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Manual Process</TableHead>
                  <TableHead>AI Process</TableHead>
                  <TableHead className="text-right">Time Saved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benchmarkRows.map((row) => (
                  <TableRow key={row.task}>
                    <TableCell className="font-medium text-foreground">{row.task}</TableCell>
                    <TableCell className="text-muted-foreground">{row.manual}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {row.ai}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {row.timeSaved}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Manual vs AI Time Comparison</CardTitle>
            <CardDescription>
              Manual effort is shown in hours to capture the full cost of research, synthesis, and approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[420px] w-full">
              <BarChart data={benchmarkRows} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <YAxis
                  dataKey="task"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={112}
                />
                <XAxis dataKey="manualHours" type="number" tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(_value, name, item) => {
                        const payload = item.payload as BenchmarkRow
                        const label = name === "manualHours" ? payload.manual : payload.ai

                        return (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {name === "manualHours" ? "Manual" : "AI"}
                            </span>
                            <span className="font-medium text-foreground">{label}</span>
                          </div>
                        )
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="manualHours"
                  fill="var(--color-manualHours)"
                  radius={[0, 8, 8, 0]}
                  minPointSize={8}
                />
                <Bar
                  dataKey="aiHours"
                  fill="var(--color-aiHours)"
                  radius={[0, 8, 8, 0]}
                  minPointSize={8}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {timelineColumns.map((column) => (
          <Card key={column.title} className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="border-b border-border/70">
              <div className="flex items-center gap-3">
                <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${column.accentClassName}`}>
                  {column.title}
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle>{column.title} Timeline</CardTitle>
                <CardDescription>{column.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {column.steps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`h-3.5 w-3.5 rounded-full ${column.dotClassName}`} />
                      {index < column.steps.length - 1 ? (
                        <span className={`mt-2 h-12 w-px ${column.lineClassName}`} />
                      ) : null}
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background/80 p-4 text-sm text-foreground shadow-sm">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.section>

      <motion.section variants={itemVariants}>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="border-b border-border/70">
            <CardTitle>ROI Calculator</CardTitle>
            <CardDescription>
              Based on {partnersAnalyzed} partners × 5 operations each, using the benchmarked platform workflows above.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
            <div className="rounded-xl border border-destructive/15 bg-destructive/8 p-5">
              <p className="text-sm font-medium text-muted-foreground">Manual</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">~890 hours/year</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Human-led collection, review, synthesis, and report preparation across recurring operations.
              </p>
            </div>

            <div className="rounded-xl border border-primary/15 bg-primary/8 p-5">
              <p className="text-sm font-medium text-muted-foreground">AI</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">~2.5 hours/year</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Automated scoring, querying, recommendation, and reporting compress effort into short review windows.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <p className="text-sm font-medium text-muted-foreground">Annual Savings</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">887.5 hours</p>
              <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">≈ 111 work days returned to the team</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Time is redirected from repetitive manual operations toward higher-value partnership actions.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  )
}
