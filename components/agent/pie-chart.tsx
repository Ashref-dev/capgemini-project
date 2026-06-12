"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart as RechartsPieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PieChartDatum {
  label: string
  value: number
}

interface PieChartProps {
  data: PieChartDatum[]
  title: string
  description?: string
  unit?: string
}

function sanitizeCssVariableName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatLargeNumber(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(value >= 10_000_000_000 ? 0 : 1)}B`
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`
  }

  return value.toLocaleString("fr-FR")
}

function hasChartCenter(value: unknown): value is { cx: number; cy: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "cx" in value &&
    "cy" in value &&
    typeof value.cx === "number" &&
    typeof value.cy === "number"
  )
}

export function PieChart({ data, title, description, unit }: PieChartProps) {
  const preparedData = React.useMemo(() => {
    const usedKeys = new Set<string>()

    return data.map((item, index) => {
      const baseKey = sanitizeCssVariableName(item.label) || `slice-${index + 1}`
      let uniqueKey = baseKey
      let suffix = 2

      while (usedKeys.has(uniqueKey)) {
        uniqueKey = `${baseKey}-${suffix}`
        suffix += 1
      }

      usedKeys.add(uniqueKey)

      return {
        ...item,
        key: uniqueKey,
        fill: `var(--chart-${(index % 5) + 1})`,
      }
    })
  }, [data])

  const chartConfig = React.useMemo<ChartConfig>(() => {
    return Object.fromEntries(
      preparedData.map((item) => [
        item.key,
        {
          label: item.label,
          color: item.fill,
        },
      ])
    )
  }, [preparedData])

  const total = React.useMemo(
    () => preparedData.reduce((sum, item) => sum + item.value, 0),
    [preparedData]
  )

  const hasData = preparedData.length > 0 && total > 0

  return (
    <Card className="border-border/70 bg-card/95">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-0">
        {hasData ? (
          <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
            <RechartsPieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="label" labelKey="label" hideLabel />}
              />
              <Pie
                data={preparedData}
                dataKey="value"
                nameKey="key"
                innerRadius={60}
                outerRadius={96}
                paddingAngle={3}
                strokeWidth={4}
              >
                {preparedData.map((item) => (
                  <Cell key={item.key} fill={item.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!hasChartCenter(viewBox)) {
                      return null
                    }

                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 8}
                          className="fill-foreground text-base font-semibold"
                        >
                          {formatLargeNumber(total)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 14}
                          className="fill-muted-foreground text-[11px]"
                        >
                          {unit ? `Total ${unit}` : "Total"}
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="label" className="flex-wrap" />} />
            </RechartsPieChart>
          </ChartContainer>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
            No chart data is available for this query yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
