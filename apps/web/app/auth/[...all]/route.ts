import { auth } from '@workspace/auth/server'

export async function GET(request: Request) {
  return auth.handler(request)
}

export async function POST(request: Request) {
  return auth.handler(request)
}

export async function PUT(request: Request) {
  return auth.handler(request)
}

export async function DELETE(request: Request) {
  return auth.handler(request)
}
