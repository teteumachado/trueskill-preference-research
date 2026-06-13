'use client'

import { LogoutButton } from "@/components/authentication/logout-button"
import { authClient } from "@workspace/auth/client"

const DashboardPage = () => {
  const {
    data: session,
    isPending,
  } = authClient.useSession()

  return (
    <>
      {isPending && (
        <h1>Carregando</h1>
      ) || (
          <div>
            <h1>{session?.user.name || 'Não logado'}</h1>
            <LogoutButton />
          </div>
        )}
    </>
  )
}

export default DashboardPage
