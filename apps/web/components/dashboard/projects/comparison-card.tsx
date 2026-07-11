'use client'

import { cn } from '@workspace/ui/lib/utils'
import type { Item } from '@/lib/api'

export const ComparisonCard = ({
  item,
  onSelect,
  disabled,
}: {
  item: Item
  onSelect: () => void
  disabled: boolean
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'group relative flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 p-8 text-center transition-all duration-200',
        'hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'border-border bg-card',
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
        {item.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-lg font-semibold">{item.name}</p>
        {item.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        )}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>μ: {item.mu.toFixed(1)}</span>
        <span>σ: {item.sigma.toFixed(1)}</span>
      </div>
    </button>
  )
}