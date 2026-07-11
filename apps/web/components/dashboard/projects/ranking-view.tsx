'use client'

import { Download } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { useRankedItems, type RankedItem } from '@/hooks/use-items'

const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-700']

function exportCSV(items: RankedItem[]) {
  const headers = ['Rank', 'Name', 'Description', 'Votes', 'Conservative Rating']
  const rows = items.map(i => [
    i.rank,
    i.name,
    i.description ?? '',
    i.voteCount,
    i.conservativeRating.toFixed(2),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ranking-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const RankingView = ({ projectId }: { projectId: string }) => {
  const { data: items, isLoading } = useRankedItems(projectId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">No items to rank.</p>
  }

  const maxRating = items[0]?.conservativeRating ?? 1

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => exportCSV(items)}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const barWidth = Math.max((item.conservativeRating / maxRating) * 100, 2)
          const isTop3 = item.rank <= 3

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border px-4 py-3"
            >
              <span
                className={`w-8 text-center text-lg font-bold tabular-nums ${
                  isTop3 ? RANK_COLORS[item.rank - 1] : 'text-muted-foreground'
                }`}
              >
                #{item.rank}
              </span>

              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <span className="truncate text-sm font-medium">{item.name}</span>
                <div className="relative h-2 w-full rounded-full bg-muted">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground">Votes</span>
                <p className="text-sm tabular-nums">{item.voteCount}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Rating</span>
                <p className="text-sm font-semibold tabular-nums">
                  {item.conservativeRating.toFixed(1)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
