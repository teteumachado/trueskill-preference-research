import { useQuery } from '@tanstack/react-query'

import { api, type ProjectListItem } from '@/lib/api'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<ProjectListItem[]>('/projects'),
  })
}
