import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Item } from '@/lib/api'

export function useNextPair(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'next-pair'],
    queryFn: () => api.get<{ itemA: Item; itemB: Item } | null>(`/projects/${projectId}/next-pair`),
  })
}