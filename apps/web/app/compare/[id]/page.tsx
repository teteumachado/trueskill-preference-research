import { headers } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function fetchProject(id: string) {
  const headersList = await headers()
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    headers: { 'Content-Type': 'application/json', Cookie: headersList.get('cookie') ?? '' },
  })
  if (!res.ok) return null
  return res.json() as Promise<{ name: string }>
}

const ComparePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const project = await fetchProject(id)

  return <CompareContent projectId={id} projectName={project?.name ?? 'Project'} />
}

export default ComparePage

import { CompareContent } from '@/components/compare/compare-content'
