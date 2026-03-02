import type { Item } from '../types/items'
import useAuthStore from '../stores/auth-store'

const BASE_URL = '/api/v1/items'

export class ItemsApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'ItemsApiError'
  }
}

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return (await res.json()) as T

  if (res.status === 401) throw new ItemsApiError('Unauthorized', 401)
  if (res.status === 404) throw new ItemsApiError('Not found', 404)

  throw new ItemsApiError(`Request failed with status ${res.status}`, res.status)
}

async function handleNoContent(res: Response): Promise<void> {
  if (res.ok) return

  if (res.status === 401) throw new ItemsApiError('Unauthorized', 401)
  if (res.status === 404) throw new ItemsApiError('Not found', 404)

  throw new ItemsApiError(`Request failed with status ${res.status}`, res.status)
}

export async function getItems(dateFrom: Date, dateTo: Date): Promise<Item[]> {
  const params = new URLSearchParams({
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
  })
  const res = await fetch(`${BASE_URL}?${params}`, {
    headers: { ...authHeader() },
  })
  return handleResponse<Item[]>(res)
}

export async function getTypes(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/types`, {
    headers: { ...authHeader() },
  })
  return handleResponse<string[]>(res)
}

export interface AddItemPaymentPayload {
  date: string
  typeName: string
  plannedAmount: number | null
  spentAmount: number | null
}

export async function addItemPayment(payload: AddItemPaymentPayload): Promise<Item> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  return handleResponse<Item>(res)
}

export async function deletePayment(itemId: string, paymentId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${itemId}/payments/${paymentId}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  })
  return handleNoContent(res)
}

export interface UpdatePaymentPayload {
  typeName: string
  plannedAmount: number | null
  spentAmount: number | null
}

export async function updatePayment(itemId: string, paymentId: string, payload: UpdatePaymentPayload): Promise<Item> {
  const res = await fetch(`${BASE_URL}/${itemId}/payments/${paymentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  return handleResponse<Item>(res)
}
