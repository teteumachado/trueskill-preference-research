'use client'

import { authClient } from "@workspace/auth/client"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu"
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  callbackUrl?: string
  asDropdownMenuItem?: boolean
}

export const LogoutButton = ({ callbackUrl, asDropdownMenuItem }: LogoutButtonProps) => {
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

  if (asDropdownMenuItem) {
    return (
      <DropdownMenuItem onClick={signOutCallback}>
        <LogOut />
        Log out
      </DropdownMenuItem>
    )
  }

  return (
    <Button onClick={signOutCallback} variant="destructive">
      <LogOut />
      Log out
    </Button>
  )
}
