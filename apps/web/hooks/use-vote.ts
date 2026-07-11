import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'

export function useVote(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { itemAId: string; itemBId: string; winnerId: string }) =>
      api.post(`/projects/${projectId}/comparisons`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}