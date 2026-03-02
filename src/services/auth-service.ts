import type { ApiValidationError, LoginResponse, User } from '../types/auth'

const BASE_URL = '/api/v1/auth'

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly validationErrors: ApiValidationError[] = [],
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T
  }

  const contentType = res.headers.get('content-type') ?? ''

  if (res.status === 400 && contentType.includes('application/json')) {
    const body = await res.json()
    if (Array.isArray(body)) {
      throw new AuthApiError('Validation failed', body as ApiValidationError[], 400)
    }
    throw new AuthApiError(String(body), [], 400)
  }

  if (res.status === 401) {
    throw new AuthApiError('Invalid email or password.', [], 401)
  }

  throw new AuthApiError(`Request failed with status ${res.status}`, [], res.status)
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<LoginResponse>(res)
}

export async function register(
  email: string,
  password: string,
  confirmPassword: string,
  firstName: string,
  lastName: string
): Promise<User> {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmPassword, firstName, lastName }),
  })
  return handleResponse<User>(res)
}
