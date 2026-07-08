import { Separator } from '@workspace/ui/components/separator'
import Link from 'next/link'
import { RegisterForm } from '@/components/authentication/register-form'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
}

export const RegisterPage = () => {
  return (
    <div className="relative isolate flex flex-col items-center">
      <p className="mt-4 mb-4 text-xl font-semibold tracking-tight">Register</p>
      <RegisterForm />
      <div className="flex w-full flex-col items-center">
        <div className="my-4 flex w-full items-center justify-center overflow-hidden">
          <Separator />
        </div>
        <Link href="/login" className="-mt-3 font-light text-muted-foreground">
          Already have an account?
        </Link>
      </div>
    </div>
  )
}

export default RegisterPage
