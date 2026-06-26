import { AlertTriangle, Lock, SearchX } from 'lucide-react'
import { headers } from 'next/headers'

import { ProjectDetail } from '@/components/dashboard/projects/project-detail'
import { ApiError, type Project } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function fetchProject(id: string): Promise<Project> {
  const headersList = await headers()
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Cookie: headersList.get('cookie') ?? '',
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) throw new ApiError(404, null)

  const project: Project = await res.json()

  if (!project) throw new ApiError(404, null)

  return project
}

const ProjectPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  try {
    const project = await fetchProject(id)

    return (
      <div>
        <ProjectDetail project={project} />
      </div>
    )
  } catch (error) {
    const status = error instanceof ApiError ? error.status : null
    const message = error instanceof ApiError ? error.message : 'Erro ao carregar projeto.'

    if (status === 404) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <SearchX className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Projeto não encontrado</h2>
          <p className="text-muted-foreground text-sm">
            O projeto que você está procurando não existe ou foi removido.
          </p>
        </div>
      )
    }

    if (status === 403) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Lock className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Sem permissão</h2>
          <p className="text-muted-foreground text-sm">
            Você não tem acesso a este projeto.
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-destructive text-sm font-medium">
          {message}
        </p>
      </div>
    )
  }
}

export default ProjectPage
