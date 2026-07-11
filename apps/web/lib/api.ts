const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    let message: string | undefined
    if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>
      if ('detail' in obj) {
        message = String(obj.detail)
      } else if ('message' in obj) {
        message = String(obj.message)
      } else if ('error' in obj) {
        message = String(obj.error)
      }
    }
    if (typeof body === 'string') message = body
    super(message ?? `API error: ${status}`)
    this.status = status
    this.body = body
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  console.debug('[API Request]', url, init?.method ?? 'GET')
  let res: Response
  try {
    res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      ...init,
    })
  } catch (error) {
    console.error('[API Fetch Error]', url, error?.constructor?.name, error)
    throw error
  }

  if (!res.ok) {
    const text = await res.text().catch(() => null)
    let body: unknown = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = text
    }
    console.error('[API Error]', res.status, url, body)
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) return null as T

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('[API JSON Error]', url, error, 'status:', res.status, 'body:', text)
    throw error
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export type ProjectListItem = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  itemCount: number
  comparisonCount: number
}

export type Project = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  itemCount: number
  comparisonCount: number
}

export type Item = {
  id: string
  projectId: string
  name: string
  description: string | null
  imageUrl: string | null
  mu: number
  sigma: number
  createdAt: string
  updatedAt: string
}
