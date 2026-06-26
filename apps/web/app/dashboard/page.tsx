'use client'

import { useEffect, useState } from 'react'

import { LogoutButton } from "@/components/authentication/logout-button"
import { authClient } from "@workspace/auth/client"

const DashboardPage = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const {
    data: session,
    isPending,
  } = authClient.useSession()

  if (!hydrated || isPending) {
    return (
      <div>
        <h1>Carregando</h1>
      </div>
    )
  }

  return (
    <div>
      <h1>{session?.user.name || 'Não logado'}</h1>
      <LogoutButton />
    </div>
  )
}

export default DashboardPage
