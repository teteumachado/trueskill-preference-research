'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Search, Trash2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'

import { useItems, useDeleteItem } from '@/hooks/use-items'
import { ApiError } from '@/lib/api'
import { ErrorBoundary } from '@/components/error-boundary'

export const ItemsTable = ({ projectId, query }: { projectId: string; query: string }) => {
  const { data: items, isLoading, isError, error } = useItems(projectId)
  const deleteItem = useDeleteItem(projectId)

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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    const status = error instanceof ApiError ? error.status : null
    const title = status === 403 ? 'Sem permissão' : 'Erro ao carregar itens'
    const message = status === 404
      ? 'Nenhum item encontrado.'
      : (error?.message ?? 'Ocorreu um erro inesperado.')

    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-destructive text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{message}</p>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={(reset, error) => (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-destructive text-sm font-medium">Erro inesperado ao renderizar tabela.</p>
        {error && <p className="text-muted-foreground text-xs">{error.message}</p>}
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )}>
      <div className="rounded-lg border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Name</TableHead>
              <TableHead className="hidden sm:table-cell">Description</TableHead>
              <TableHead className="w-20 text-right">μ</TableHead>
              <TableHead className="w-20 text-right">σ</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium truncate max-w-0">
                    {item.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell max-w-0 truncate text-muted-foreground">
                    {item.description ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.mu.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {item.sigma.toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem.mutate(item.id)}
                      disabled={deleteItem.isPending}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {query ? 'No items match your search.' : 'No items yet. Add one to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ErrorBoundary>
  )
}