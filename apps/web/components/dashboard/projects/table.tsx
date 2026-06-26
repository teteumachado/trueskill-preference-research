"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Loader2, Search } from "lucide-react"

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

export function ProjectsTable() {
  const [query, setQuery] = useState("")
  const { data: projects, isLoading } = useProjects()

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

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Buscar projeto..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
          aria-label="Buscar projeto"
        />
      </div>

      <div className="rounded-lg border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Nome do projeto</TableHead>
              <TableHead className="hidden sm:table-cell">Descrição</TableHead>
              <TableHead className="hidden sm:table-cell w-24 text-right">Itens</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Ações</span>
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
                      href={`/projetos/${project.id}`}
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
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredProjects.length}{" "}
        {filteredProjects.length === 1 ? "projeto" : "projetos"}
      </p>
    </div>
  )
}
