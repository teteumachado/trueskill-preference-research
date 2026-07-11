'use client'

import { useMemo, useState } from 'react'
import { Download, Search, Trash2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { useRankedItems, useDeleteItem, type RankedItem } from '@/hooks/use-items'
import { CreateItemDialog } from './create-item-dialog'
import { EditItemDialog } from './edit-item-dialog'

const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-700']

function exportCSV(items: RankedItem[]) {
  const headers = ['Rank', 'Name', 'Description', 'Votes', 'Rating']
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

export const RankedItemsTable = ({ projectId }: { projectId: string }) => {
  const { data: items, isLoading } = useRankedItems(projectId)
  const deleteItem = useDeleteItem(projectId)

  const [query, setQuery] = useState('')
  const [deletingItem, setDeletingItem] = useState<RankedItem | null>(null)

  const filteredItems = useMemo(() => {
    if (!items) return []
    const term = query.trim().toLowerCase()
    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(term) ||
        (item.description ?? '').toLowerCase().includes(term)
      )
    })
  }, [query, items])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search items..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            aria-label="Search items"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(filteredItems)}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          <CreateItemDialog projectId={projectId} />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-24 text-right">Votes</TableHead>
              <TableHead className="w-20">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isTop3 = item.rank <= 3

                return (
                  <TableRow key={item.id}>
                    <TableCell
                      className={`text-lg font-bold tabular-nums ${
                        isTop3 ? RANK_COLORS[item.rank - 1] : 'text-muted-foreground'
                      }`}
                    >
                      #{item.rank}
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-0">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {item.voteCount}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <EditItemDialog projectId={projectId} item={item} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingItem(item)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  {query
                    ? 'No items match your search.'
                    : 'No items yet. Add one to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deletingItem} onOpenChange={(open) => { if (!open) setDeletingItem(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingItem?.name}</strong>? This action cannot be undone. All comparisons involving this item will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingItem) deleteItem.mutate(deletingItem.id)
                setDeletingItem(null)
              }}
              disabled={deleteItem.isPending}
            >
              {deleteItem.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
