import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

export type ProjectStats = {
  voterCount: number
  comparisonCount: number
  comparisonsOverTime: Array<{ date: string; count: number }>
}

export function useProjectStats(projectId: string, period: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'stats', period],
    queryFn: () => api.get<ProjectStats>(`/projects/${projectId}/stats?period=${period}`),
  })
}
