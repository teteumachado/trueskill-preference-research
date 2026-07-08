'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@workspace/ui/components/input'

import type { Project } from '@/lib/api'
import { useProject } from '@/hooks/use-find-project'
import { useItems } from '@/hooks/use-items'
import { CreateItemDialog } from './create-item-dialog'
import { ItemsTable } from './items-table'

export const ProjectDetail = ({ project }: { project: Project }) => {
  const [query, setQuery] = useState('')
  const { data: projectData } = useProject(project.id)
  const { data: items } = useItems(project.id)

  const current = projectData ?? project
  const itemCount = items?.length ?? current.itemCount

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{current.name}</h1>
          {current.description && (
            <p className="mt-1 text-muted-foreground">{current.description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="rounded-lg border px-3 py-2">
          <span className="text-muted-foreground">Items</span>
          <p className="text-lg font-semibold tabular-nums">{itemCount}</p>
        </div>
        <div className="rounded-lg border px-3 py-2">
          <span className="text-muted-foreground">Comparisons</span>
          <p className="text-lg font-semibold tabular-nums">{current.comparisonCount}</p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
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
          <CreateItemDialog projectId={project.id} />
        </div>
        <ItemsTable projectId={project.id} query={query} />
      </div>
    </div>
  )
}