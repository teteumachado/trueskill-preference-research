'use client'

import { QueryProvider } from '@/components/query-provider'

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <QueryProvider>{children}</QueryProvider>
)
