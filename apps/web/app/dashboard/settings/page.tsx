import { UpdateUserForm } from "@/components/dashboard/settings/accounts-form"

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
}

const AccountsSettingsPage = () => {
  return (
    <div className="max-w-md">
      <UpdateUserForm />
    </div>
  )
}

export default AccountsSettingsPage
