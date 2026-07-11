'use client'

import { Copy, Shuffle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'

import type { Project } from '@/lib/api'
import { useProject } from '@/hooks/use-find-project'
import { ProjectStats } from './project-stats'
import { RankedItemsTable } from './ranked-items-table'
import { SuccessToast } from '@/lib/toast'

export const ProjectDetail = ({ project }: { project: Project }) => {
  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/compare/${project.id}`)
    SuccessToast('Link da pesquisa copiado com sucesso.')
  }
  const { data: projectData } = useProject(project.id)

  const current = projectData ?? project

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{current.name}</h1>
          {current.description && (
            <p className="mt-1 text-muted-foreground">{current.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" onClick={copyLink} title="Copy comparison link">
            <Copy className="size-4" />
          </Button>
          <Link href={`/compare/${project.id}`}>
            <Button>
              <Shuffle />
              Compare
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t pt-4">
        <ProjectStats projectId={project.id} />
      </div>

      <div className="border-t pt-4">
        <RankedItemsTable projectId={project.id} />
      </div>
    </div>
  )
}
