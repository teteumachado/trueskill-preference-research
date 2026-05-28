import { Separator } from '@workspace/ui/components/separator'
import Link from 'next/link'
import { LoginForm } from '@/components/authentication/login-form'

export const LoginPage = () => {
  return (
    <div className="relative isolate flex flex-col items-center">
      <p className="mt-4 mb-4 text-xl font-semibold tracking-tight">Login</p>
      <LoginForm />
      <div className="flex w-full flex-col items-center">
        <div className="my-4 flex w-full items-center justify-center overflow-hidden">
          <Separator />
        </div>
        <Link href="/register" className="-mt-3 font-light text-muted-foreground">
          Haven&apos;t registered yet?
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
