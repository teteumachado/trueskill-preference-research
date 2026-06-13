'use client'

import { authClient } from "@workspace/auth/client"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  callbackUrl?: string
}

export const LogoutButton = ({ callbackUrl }: LogoutButtonProps) => {
  const router = useRouter()

  const signOutCallback = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(callbackUrl || "/login");
        },
      },
    })
  }

  return (
    <Button onClick={signOutCallback} variant="destructive">
      <LogOut />
      Log out
    </Button>
  )
}
