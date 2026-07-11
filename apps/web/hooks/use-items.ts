import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type Item } from '@/lib/api'

export type RankedItem = Item & {
  rank: number
  voteCount: number
  conservativeRating: number
}

export function useItems(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'items'],
    queryFn: () => api.get<Item[]>(`/projects/${projectId}/items`),
  })
}

export function useRankedItems(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'items', 'ranking'],
    queryFn: () => api.get<RankedItem[]>(`/projects/${projectId}/items/ranking`),
  })
}

export function useCreateItem(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<Item>(`/projects/${projectId}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}

export function useUpdateItem(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: { name?: string; description?: string | null } }) =>
      api.put<Item>(`/projects/${projectId}/items/${itemId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'items', 'ranking'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}

export function useDeleteItem(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) =>
      api.delete(`/projects/${projectId}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}