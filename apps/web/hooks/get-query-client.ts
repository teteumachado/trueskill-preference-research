import {
  QueryCache,
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query'
import { ErrorToast } from '@/lib/toast'
import { ApiError } from '@/lib/api'

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error('[Query Error]', error?.constructor?.name, error, error instanceof ApiError ? { status: error.status, body: error.body, message: error.message } : undefined)
        const apiErr = error as { status?: number; body?: unknown; message?: string }
        ErrorToast(apiErr.status ? `[${apiErr.status}] ${apiErr.message}` : error.message)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
