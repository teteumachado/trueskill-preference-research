'use client'

import { getQueryClient } from "@/hooks/get-query-client"
import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [client] = useState(getQueryClient)
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
