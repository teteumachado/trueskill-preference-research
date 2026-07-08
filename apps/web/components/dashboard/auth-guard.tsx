'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { authClient } from '@workspace/auth/client'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) return

    if (!session) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      router.push(`/login?redirect=${redirect}`)
    }
  }, [session, isPending, router])

  if (isPending || !session) {
    return null
  }

  return <>{children}</>
}
