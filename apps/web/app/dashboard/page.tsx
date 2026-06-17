'use client'

import { LogoutButton } from "@/components/authentication/logout-button"
import { authClient } from "@workspace/auth/client"

const DashboardPage = () => {
  const {
    data: session,
    isPending,
  } = authClient.useSession()

  return (
    <div>
      {isPending ? (
        <h1>Carregando</h1>
      ) : (
        <>
          <h1>{session?.user.name || 'Não logado'}</h1>
          <LogoutButton />
        </>
      )}
    </div>
  )
}

export default DashboardPage
