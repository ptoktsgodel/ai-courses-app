import type { User } from '../types/auth'
import useAuthStore from '../stores/auth-store'

const BASE_URL = '/api/v1/users'

export class UsersApiError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message)
    this.name = 'UsersApiError'
  }
}

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return (await res.json()) as T
  throw new UsersApiError(`Request failed with status ${res.status}`, res.status)
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${BASE_URL}/me`, { headers: { ...authHeader() } })
  return handleResponse<User>(res)
}
