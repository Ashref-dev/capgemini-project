import { and, asc, count, eq, gte, inArray, isNull, or, sql } from "drizzle-orm"

import { db } from "@/lib/server/db/config"
import {
  capgeminiEmployees,
  milestones,
  partners,
  projectAllocations,
  projectDocuments,
  projects,
  projectTasks,
  type CapgeminiEmployee,
  type Milestone,
  type Project,
  type ProjectTask,
} from "@/lib/server/db/schema"

type RagStatus = "R" | "Y" | "G"
type MilestoneStatus = "pending" | "in_progress" | "done" | "missed"

export interface ProjectHealthAnalysis {
  projectId: number
  projectName: string
  score: number
  rag: RagStatus
  reasons: string[]
  metrics: {
    percentComplete: number
    timeElapsedRatio: number
    missedMilestones: number
    blockedTasks: number
    daysSinceLastActivity: number
  }
}

export interface AtRiskProject {
  projectId: number
  projectName: string
  partnerName: string | null
  rag: RagStatus
  score: number
  topReasons: string[]
}

export interface AtRiskProjectFilters {
  partnerId?: number
  minRiskScore?: number
}

export interface ProjectDelayForecast {
  projectId: number
  projectName: string
  originalEndDate: string | null
  predictedEndDate: string | null
  delayDays: number
  confidence: "low" | "medium" | "high"
  basis: string
}

export interface StaffingRecommendation {
  employeeId: number
  fullName: string
  email: string
  role: string | null
  department: string | null
  fitScore: number
  availabilityPercent: number
  currentProjects: number
  reasons: string[]
}

export interface CriticalPathAnalysis {
  projectId: number
  projectName: string
  criticalMilestones: Array<{
    milestoneId: number
    name: string
    dueDate: string | null
    status: MilestoneStatus
    daysUntilDue: number | null
  }>
  totalDays: number
  reasoning: string
}

export interface CrossEntityAnalysisArgs {
  partnerId?: number
  projectId?: number
}

export interface CrossEntityAnalysisResult {
  partner: {
    id: number
    name: string
    category: string
    activeProjectsCount: number
    totalBudget: number
    avgHealthScore: number
  } | null
  project: {
    id: number
    name: string
    health: ProjectHealthAnalysis
    teamSize: number
    docsCount: number
  } | null
  jointInsights: string[]
}

const DAY_IN_MS = 86_400_000
const ACTIVE_PROJECT_STATUSES = ["active", "on_hold"] as const

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function asDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysBetween(later: string | Date, earlier: string | Date): number {
  return (new Date(later).getTime() - new Date(earlier).getTime()) / DAY_IN_MS
}

function wholeDaysBetween(later: string | Date, earlier: string | Date): number {
  return Math.floor(daysBetween(later, earlier))
}

function formatIsoDate(value: string | Date | null | undefined): string | null {
  const date = asDate(value)
  if (!date) {
    return null
  }

  return date.toISOString().slice(0, 10)
}

function addDays(value: string | Date, days: number): Date {
  const date = new Date(value)
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

function ragFromScore(score: number): RagStatus {
  if (score < 40) {
    return "R"
  }

  if (score < 70) {
    return "Y"
  }

  return "G"
}

function normalizeMilestoneStatus(status: string): MilestoneStatus {
  if (status === "in_progress" || status === "done" || status === "missed") {
    return status
  }

  return "pending"
}

function calculateTimeElapsedRatio(project: Project, today: Date): number {
  const startDate = asDate(project.startDate)
  const endDate = asDate(project.endDate)

  if (!startDate || !endDate) {
    return 0
  }

  const totalDays = daysBetween(endDate, startDate)
  if (totalDays <= 0) {
    return 0
  }

  return Math.max(0, Math.min(1, daysBetween(today, startDate) / totalDays))
}

function calculateDaysSinceLastActivity(project: Project, projectMilestones: Milestone[], tasks: ProjectTask[], today: Date): number {
  const activityDates = [...projectMilestones.map((item) => item.updatedAt), ...tasks.map((item) => item.updatedAt)]
    .map(asDate)
    .filter((value): value is Date => value !== null)

  const lastActivity = activityDates.length > 0
    ? activityDates.reduce((latest, current) => current.getTime() > latest.getTime() ? current : latest)
    : asDate(project.updatedAt)

  if (!lastActivity) {
    return 0
  }

  return Math.max(0, wholeDaysBetween(today, lastActivity))
}

async function fetchProjectOrThrow(projectId: number): Promise<Project> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)

  if (!project) {
    throw new Error(`Project ${projectId} not found`)
  }

  return project
}

function sumNumbers(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

function humanizeRag(rag: RagStatus): string {
  if (rag === "G") {
    return "Green"
  }

  if (rag === "Y") {
    return "Yellow"
  }

  return "Red"
}

export async function analyzeProjectHealth(projectId: number): Promise<ProjectHealthAnalysis> {
  const project = await fetchProjectOrThrow(projectId)
  const [projectMilestones, tasks] = await Promise.all([
    db.select().from(milestones).where(eq(milestones.projectId, projectId)),
    db.select().from(projectTasks).where(eq(projectTasks.projectId, projectId)),
  ])

  const today = new Date()
  const timeElapsedRatio = calculateTimeElapsedRatio(project, today)
  const percentComplete = project.percentComplete ?? 0
  const missedMilestones = projectMilestones.filter((item) => item.status === "missed").length
  const blockedTasks = tasks.filter((item) => item.status === "blocked").length
  const daysSinceLastActivity = calculateDaysSinceLastActivity(project, projectMilestones, tasks, today)
  const reasons: string[] = []
  let score = 100

  if (percentComplete < timeElapsedRatio * 100 - 10) {
    score -= 25
    reasons.push(
      `Behind schedule: ${percentComplete}% complete while ${Math.round(timeElapsedRatio * 100)}% of the planned timeline has elapsed.`
    )
  }

  const missedMilestoneDeduction = Math.min(30, missedMilestones * 10)
  if (missedMilestoneDeduction > 0) {
    score -= missedMilestoneDeduction
    reasons.push(`${missedMilestones} missed milestone${missedMilestones === 1 ? "" : "s"} reduce delivery confidence.`)
  }

  const blockedTaskDeduction = Math.min(20, blockedTasks * 5)
  if (blockedTaskDeduction > 0) {
    score -= blockedTaskDeduction
    reasons.push(`${blockedTasks} blocked task${blockedTasks === 1 ? "" : "s"} need intervention.`)
  }

  if (daysSinceLastActivity > 14) {
    score -= 15
    reasons.push(`No task or milestone activity for ${daysSinceLastActivity} days.`)
  }

  if (project.status === "on_hold") {
    score -= 10
    reasons.push("Project is currently on hold.")
  }

  const finalScore = clampScore(score)

  if (reasons.length === 0) {
    reasons.push("No major delivery risks detected from schedule, milestones, blockers, or recent activity.")
  }

  return {
    projectId: project.id,
    projectName: project.name,
    score: finalScore,
    rag: ragFromScore(finalScore),
    reasons,
    metrics: {
      percentComplete,
      timeElapsedRatio: roundOneDecimal(timeElapsedRatio * 10) / 10,
      missedMilestones,
      blockedTasks,
      daysSinceLastActivity,
    },
  }
}

export async function identifyAtRiskProjects(filters: AtRiskProjectFilters = {}): Promise<AtRiskProject[]> {
  const conditions = [inArray(projects.status, [...ACTIVE_PROJECT_STATUSES])]

  if (filters.partnerId !== undefined) {
    conditions.push(eq(projects.partnerId, filters.partnerId))
  }

  const rows = await db
    .select({
      projectId: projects.id,
      projectName: projects.name,
      partnerName: partners.name,
    })
    .from(projects)
    .leftJoin(partners, eq(projects.partnerId, partners.id))
    .where(and(...conditions))
    .limit(50)

  const minRiskScore = filters.minRiskScore ?? 60
  const analyses = await Promise.all(rows.map(async (row): Promise<AtRiskProject | null> => {
    const health = await analyzeProjectHealth(row.projectId)
    const isAtRisk = health.rag === "R" || (health.rag === "Y" && health.score < minRiskScore)

    if (!isAtRisk) {
      return null
    }

    return {
      projectId: row.projectId,
      projectName: row.projectName,
      partnerName: row.partnerName,
      rag: health.rag,
      score: health.score,
      topReasons: health.reasons.slice(0, 3),
    }
  }))

  return analyses
    .filter((item): item is AtRiskProject => item !== null)
    .sort((left, right) => left.score - right.score)
    .slice(0, 20)
}

export async function forecastProjectDelay(projectId: number): Promise<ProjectDelayForecast> {
  const project = await fetchProjectOrThrow(projectId)
  const originalEndDate = formatIsoDate(project.endDate)

  if (!project.endDate) {
    return {
      projectId: project.id,
      projectName: project.name,
      originalEndDate: null,
      predictedEndDate: null,
      delayDays: 0,
      confidence: "low",
      basis: "Project has no planned end date, so delay forecasting is not available.",
    }
  }

  const projectMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))

  const completedMilestones = projectMilestones.filter((item) => item.status === "done" && item.dueDate !== null)
  const slippages = completedMilestones.map((item) => daysBetween(item.updatedAt, item.dueDate as string))
  const avgSlippage = slippages.length > 0 ? sumNumbers(slippages) / slippages.length : 0
  const remainingMilestones = projectMilestones.filter((item) => item.status !== "done").length
  const predictedDelay = Math.round(avgSlippage * remainingMilestones)
  const predictedEndDate = formatIsoDate(addDays(project.endDate, predictedDelay))
  const confidence = completedMilestones.length >= 5 ? "high" : completedMilestones.length >= 2 ? "medium" : "low"

  return {
    projectId: project.id,
    projectName: project.name,
    originalEndDate,
    predictedEndDate,
    delayDays: predictedDelay,
    confidence,
    basis: `Avg milestone slippage of ${roundOneDecimal(avgSlippage)} days extrapolated over ${remainingMilestones} remaining milestone${remainingMilestones === 1 ? "" : "s"}.`,
  }
}

function employeeFullName(employee: CapgeminiEmployee): string {
  return `${employee.firstName} ${employee.lastName}`.trim()
}

function countMatchingTags(tags: string[], employee: CapgeminiEmployee): number {
  const searchableProfile = [employee.role, employee.department]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .toLowerCase()

  return tags.filter((tag) => searchableProfile.includes(tag.toLowerCase())).length
}

export async function recommendStaffing(projectId: number): Promise<StaffingRecommendation[]> {
  const project = await fetchProjectOrThrow(projectId)
  const employees = await db.select().from(capgeminiEmployees)
  const today = formatIsoDate(new Date())
  const activeAllocations = await db
    .select({
      employeeId: projectAllocations.employeeId,
      projectCount: count(projectAllocations.projectId),
      fteTotal: sql<number>`coalesce(sum(${projectAllocations.ftePercent}), 0)`,
    })
    .from(projectAllocations)
    .where(
      or(
        isNull(projectAllocations.endDate),
        today === null ? isNull(projectAllocations.endDate) : gte(projectAllocations.endDate, today)
      )
    )
    .groupBy(projectAllocations.employeeId)

  const allocationByEmployee = new Map<number, { currentProjects: number; allocatedFte: number }>()
  for (const allocation of activeAllocations) {
    allocationByEmployee.set(allocation.employeeId, {
      currentProjects: Number(allocation.projectCount),
      allocatedFte: Number(allocation.fteTotal),
    })
  }

  const tags = project.tags.map((tag) => tag.toLowerCase())

  return employees
    .map((employee): StaffingRecommendation => {
      const allocation = allocationByEmployee.get(employee.id)
      const currentProjects = allocation?.currentProjects ?? 0
      const availabilityPercent = Math.max(0, 100 - (allocation?.allocatedFte ?? 0))
      const matchingTags = countMatchingTags(tags, employee)
      const reasons: string[] = []
      let fitScore = 50 + matchingTags * 5

      if (matchingTags > 0) {
        reasons.push(`${matchingTags} project skill tag${matchingTags === 1 ? "" : "s"} match role or department.`)
      } else if (tags.length > 0) {
        reasons.push("No direct tag match found in role or department.")
      } else {
        reasons.push("Project has no skill tags, so fit is driven by availability and workload.")
      }

      if (availabilityPercent >= 50) {
        fitScore += 20
        reasons.push(`${availabilityPercent}% availability supports near-term staffing.`)
      } else if (availabilityPercent > 0) {
        reasons.push(`${availabilityPercent}% availability leaves limited staffing capacity.`)
      }

      if (currentProjects < 3) {
        fitScore += 10
        reasons.push(`Currently allocated to ${currentProjects} project${currentProjects === 1 ? "" : "s"}.`)
      } else if (currentProjects >= 4) {
        fitScore -= 10
        reasons.push(`High workload with ${currentProjects} active projects.`)
      } else {
        reasons.push(`Moderate workload with ${currentProjects} active projects.`)
      }

      return {
        employeeId: employee.id,
        fullName: employeeFullName(employee),
        email: employee.email,
        role: employee.role,
        department: employee.department,
        fitScore: clampScore(fitScore),
        availabilityPercent,
        currentProjects,
        reasons,
      }
    })
    .filter((item) => item.availabilityPercent > 0)
    .sort((left, right) => right.fitScore - left.fitScore)
    .slice(0, 8)
}

export async function findCriticalPath(projectId: number): Promise<CriticalPathAnalysis> {
  const project = await fetchProjectOrThrow(projectId)
  const openMilestones = await db
    .select()
    .from(milestones)
    .where(and(eq(milestones.projectId, projectId), sql`${milestones.status} <> 'done'`))
    .orderBy(sql`${milestones.dueDate} asc nulls last`, asc(milestones.order), asc(milestones.id))

  const today = new Date()
  const criticalMilestones = openMilestones.map((item) => {
    const dueDate = formatIsoDate(item.dueDate)

    return {
      milestoneId: item.id,
      name: item.name,
      dueDate,
      status: normalizeMilestoneStatus(item.status),
      daysUntilDue: dueDate ? wholeDaysBetween(dueDate, today) : null,
    }
  })

  const datedMilestones = criticalMilestones.filter((item): item is typeof item & { dueDate: string } => item.dueDate !== null)
  const earliestDueDate = datedMilestones[0]?.dueDate ?? null
  const latestDueDate = datedMilestones[datedMilestones.length - 1]?.dueDate ?? null
  const totalDays = earliestDueDate && latestDueDate ? Math.max(0, Math.round(daysBetween(latestDueDate, earliestDueDate))) : 0
  const firstMilestone = criticalMilestones[0]
  const firstDueText = firstMilestone?.daysUntilDue === null
    ? "with no due date"
    : firstMilestone && firstMilestone.daysUntilDue < 0
      ? `due in ${firstMilestone.daysUntilDue} days (overdue)`
      : firstMilestone
        ? `due in ${firstMilestone.daysUntilDue} days`
        : "with no open milestone"

  return {
    projectId: project.id,
    projectName: project.name,
    criticalMilestones,
    totalDays,
    reasoning: firstMilestone
      ? `${criticalMilestones.length} open milestone${criticalMilestones.length === 1 ? "" : "s"} span ${totalDays} days. Earliest at risk: ${firstMilestone.name} ${firstDueText}.`
      : "No open milestones remain, so no critical path is currently exposed.",
  }
}

async function countProjectAllocations(projectId: number): Promise<number> {
  const [row] = await db
    .select({ value: count(projectAllocations.id) })
    .from(projectAllocations)
    .where(eq(projectAllocations.projectId, projectId))

  return Number(row?.value ?? 0)
}

async function countProjectDocuments(projectId: number): Promise<number> {
  const [row] = await db
    .select({ value: count(projectDocuments.id) })
    .from(projectDocuments)
    .where(eq(projectDocuments.projectId, projectId))

  return Number(row?.value ?? 0)
}

export async function crossEntityAnalysis(args: CrossEntityAnalysisArgs): Promise<CrossEntityAnalysisResult> {
  if (args.partnerId === undefined && args.projectId === undefined) {
    throw new Error("crossEntityAnalysis requires at least one of partnerId or projectId")
  }

  const projectPart = args.projectId === undefined
    ? null
    : await (async () => {
      const project = await fetchProjectOrThrow(args.projectId as number)
      const [health, teamSize, docsCount] = await Promise.all([
        analyzeProjectHealth(project.id),
        countProjectAllocations(project.id),
        countProjectDocuments(project.id),
      ])

      return {
        id: project.id,
        name: project.name,
        health,
        teamSize,
        docsCount,
      }
    })()

  const partnerPart = args.partnerId === undefined
    ? null
    : await (async () => {
      const [partner] = await db.select().from(partners).where(eq(partners.id, args.partnerId as number)).limit(1)

      if (!partner) {
        throw new Error(`Partner ${args.partnerId} not found`)
      }

      const partnerProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.partnerId, partner.id))

      const activeProjects = partnerProjects.filter((item) => ACTIVE_PROJECT_STATUSES.some((status) => status === item.status))
      const healthScores = await Promise.all(activeProjects.map((item) => analyzeProjectHealth(item.id)))
      const totalBudget = activeProjects.reduce((total, item) => total + (item.budget ?? 0), 0)
      const avgHealthScore = healthScores.length > 0
        ? clampScore(sumNumbers(healthScores.map((item) => item.score)) / healthScores.length)
        : 0

      return {
        id: partner.id,
        name: partner.name,
        category: partner.categories ?? "uncategorized",
        activeProjectsCount: activeProjects.length,
        totalBudget,
        avgHealthScore,
      }
    })()

  const jointInsights: string[] = []

  if (partnerPart) {
    jointInsights.push(
      `${partnerPart.name} has ${partnerPart.activeProjectsCount} active project${partnerPart.activeProjectsCount === 1 ? "" : "s"} with average health ${partnerPart.avgHealthScore}/100 (${humanizeRag(ragFromScore(partnerPart.avgHealthScore))}).`
    )
    jointInsights.push(
      `The active project portfolio budget totals ${Math.round(partnerPart.totalBudget).toLocaleString("fr-FR")} across the ${partnerPart.category} relationship.`
    )
  }

  if (projectPart) {
    jointInsights.push(
      `The current project (${projectPart.name}) is scored ${projectPart.health.score}/100 (${humanizeRag(projectPart.health.rag)}) with ${projectPart.teamSize} allocated team member${projectPart.teamSize === 1 ? "" : "s"}.`
    )
    jointInsights.push(
      `${projectPart.docsCount} project document${projectPart.docsCount === 1 ? "" : "s"} are available for governance and delivery traceability.`
    )
  }

  if (partnerPart && projectPart) {
    const comparison = projectPart.health.score - partnerPart.avgHealthScore
    const direction = comparison >= 0 ? "above" : "below"
    jointInsights.push(
      `${projectPart.name} is ${Math.abs(comparison)} points ${direction} the partner portfolio average, which helps prioritize whether intervention should stay project-specific or expand to the wider account.`
    )
  }

  if (jointInsights.length < 3) {
    jointInsights.push("Use health, staffing, document coverage, and portfolio budget together before recommending delivery action.")
  }

  return {
    partner: partnerPart,
    project: projectPart,
    jointInsights: jointInsights.slice(0, 5),
  }
}
