export interface Payment {
  id: string
  itemId: string
  typeId: string
  typeName: string
  plannedAmount: number | null
  spentAmount: number | null
}

export interface Item {
  id: string
  userId: string
  date: string
  payments: Payment[]
}

export type DayItems = Record<string, Item>

export function getItemTotal(item: Item): number {
  return (item.payments ?? []).reduce((sum, p) => sum + (p.spentAmount ?? p.plannedAmount ?? 0), 0)
}
