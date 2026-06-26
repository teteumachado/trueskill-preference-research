import { useQuery } from '@tanstack/react-query'

import { api, type Project } from '@/lib/api'

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
  })
}
