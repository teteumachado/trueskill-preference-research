'use client'

import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@workspace/ui/components/chart'

import { useProjectStats } from '@/hooks/use-project-stats'

const PERIODS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
] as const

const chartConfig = {
  comparisons: {
    label: 'Comparisons',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export const ProjectStats = ({ projectId }: { projectId: string }) => {
  const [period, setPeriod] = useState('7d')
  const { data, isLoading } = useProjectStats(projectId, period)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Voters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {isLoading ? '-' : data?.voterCount ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comparisons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {isLoading ? '-' : data?.comparisonCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Comparisons over time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <AreaChart data={data?.comparisonsOverTime ?? []}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => {
                  if (!value) return ''
                  if (period === '24h') return value.split(' ')[1]?.slice(0, 5) ?? ''
                  return value.slice(5)
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="count"
                type="monotone"
                fill="var(--color-comparisons)"
                fillOpacity={0.2}
                stroke="var(--color-comparisons)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
