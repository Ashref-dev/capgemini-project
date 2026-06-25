"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts"

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

interface LineChartSeries {
  seriesName: string
  value: number
}

interface LineChartDatum {
  xAxisLabel: string
  series: LineChartSeries[]
}

interface LineChartProps {
  data: LineChartDatum[]
  title: string
  description?: string
  yAxisLabel?: string
}

interface SeriesDefinition {
  key: string
  seriesName: string
  color: string
}

function sanitizeCssVariableName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function buildSeriesDefinitions(data: LineChartDatum[]): SeriesDefinition[] {
  const seenNames = new Set<string>()
  const usedKeys = new Set<string>()
  const definitions: SeriesDefinition[] = []

  for (const row of data) {
    for (const item of row.series) {
      if (seenNames.has(item.seriesName)) {
        continue
      }

      seenNames.add(item.seriesName)

      const baseKey =
        sanitizeCssVariableName(item.seriesName) ||
        `series-${definitions.length + 1}`

      let uniqueKey = baseKey
      let suffix = 2

      while (usedKeys.has(uniqueKey)) {
        uniqueKey = `${baseKey}-${suffix}`
        suffix += 1
      }

      usedKeys.add(uniqueKey)

      definitions.push({
        key: uniqueKey,
        seriesName: item.seriesName,
        color: `var(--chart-${(definitions.length % 5) + 1})`,
      })
    }
  }

  return definitions
}

function formatAxisTick(value: number | string) {
  if (typeof value !== "number") {
    return value
  }

  return value.toLocaleString("fr-FR", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  })
}

export function LineChart({ data, title, description, yAxisLabel }: LineChartProps) {
  const seriesDefinitions = React.useMemo(() => buildSeriesDefinitions(data), [data])

  const seriesKeyMap = React.useMemo(
    () => new Map(seriesDefinitions.map((entry) => [entry.seriesName, entry.key])),
    [seriesDefinitions]
  )

  const chartData = React.useMemo(() => {
    return data.map((row) => {
      const nextRow: Record<string, number | string> = {
        xAxisLabel: row.xAxisLabel,
      }

      for (const entry of seriesDefinitions) {
        nextRow[entry.key] = 0
      }

      for (const item of row.series) {
        const key = seriesKeyMap.get(item.seriesName)

        if (key) {
          nextRow[key] = item.value
        }
      }

      return nextRow
    })
  }, [data, seriesDefinitions, seriesKeyMap])

  const chartConfig = React.useMemo<ChartConfig>(() => {
    return Object.fromEntries(
      seriesDefinitions.map((entry) => [
        entry.key,
        {
          label: entry.seriesName,
          color: entry.color,
        },
      ])
    )
  }, [seriesDefinitions])

  const hasData = chartData.length > 0 && seriesDefinitions.length > 0

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-0">
        {hasData ? (
          <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
            <RechartsLineChart data={chartData} accessibilityLayer margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="xAxisLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatAxisTick}
                label={
                  yAxisLabel
                    ? {
                        value: yAxisLabel,
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle" },
                      }
                    : undefined
                }
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
              {seriesDefinitions.map((entry) => (
                <Line
                  key={entry.key}
                  dataKey={entry.key}
                  type="monotone"
                  stroke={`var(--color-${entry.key})`}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ))}
            </RechartsLineChart>
          </ChartContainer>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
            Aucune donnée disponible pour cette requête.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
