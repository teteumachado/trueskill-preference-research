"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ChevronRight, Loader2, Search } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useProjects } from "@/hooks/use-projects"
import { ApiError } from "@/lib/api"
import { ErrorBoundary } from "@/components/error-boundary"

export function ProjectsTable() {
  const [query, setQuery] = useState("")
  const { data: projects, isLoading, isError, error } = useProjects()

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    const term = query.trim().toLowerCase()
    return projects.filter((project) => {
      return (
        project.name.toLowerCase().includes(term) ||
        (project.description ?? "").toLowerCase().includes(term)
      )
    })
  }, [query, projects])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    const status = error instanceof ApiError ? error.status : null
    const title = status === 403 ? 'Access denied' : 'Failed to load projects'
    const message = status === 404
      ? 'No projects found.'
      : (error?.message ?? 'An unexpected error occurred.')

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
        <p className="text-destructive text-sm font-medium">
          Unexpected error while rendering table.
        </p>
        {error && (
          <p className="text-muted-foreground text-xs">{error.message}</p>
        )}
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    )}>
      <div className="flex flex-col gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search projects..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            aria-label="Search projects"
          />
        </div>

        <div className="rounded-lg border">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Project name</TableHead>
                <TableHead className="hidden sm:table-cell">Description</TableHead>
                <TableHead className="hidden sm:table-cell w-24 text-right">Items</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="group cursor-pointer"
                  >
                    <TableCell className="font-medium truncate max-w-0">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-0 truncate text-muted-foreground">
                      {project.description ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-muted-foreground tabular-nums">
                      {project.itemCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <ChevronRight
                        className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredProjects.length}{" "}
          {filteredProjects.length === 1 ? "project" : "projects"}
        </p>
      </div>
    </ErrorBoundary>
  )
}
