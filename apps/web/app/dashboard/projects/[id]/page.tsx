import { AlertTriangle, Lock, SearchX } from 'lucide-react'
import { headers } from 'next/headers'

import { ProjectDetail } from '@/components/dashboard/projects/project-detail'
import { SetTitle } from '@/components/dashboard/set-title'
import { ApiError, type Project } from '@/lib/api'
import type { Metadata } from 'next'

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

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> => {
  const { id } = await params

  try {
    const project = await fetchProject(id)
    return { title: project.name }
  } catch {
    return { title: 'Project' }
  }
}

const ProjectPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  try {
    var project = await fetchProject(id) // eslint-disable-line no-var
  } catch (error) {
    const status = error instanceof ApiError ? error.status : null
    const message = error instanceof ApiError ? error.message : 'Failed to load project.'

    if (status === 404) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <SearchX className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Project not found</h2>
          <p className="text-muted-foreground text-sm">
            The project you are looking for does not exist or has been removed.
          </p>
        </div>
      )
    }

    if (status === 403) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Lock className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Access denied</h2>
          <p className="text-muted-foreground text-sm">
            You do not have access to this project.
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

  return (
    <div>
      <SetTitle title={`Project - ${project.name}`} />
      <ProjectDetail project={project} />
    </div>
  )
}

export default ProjectPage
