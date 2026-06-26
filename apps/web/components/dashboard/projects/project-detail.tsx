'use client'

import type { Project } from '@/lib/api'

export const ProjectDetail = ({ project }: { project: Project }) => {
  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description ?? '—'}</p>
    </div>
  )
}
