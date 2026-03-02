import { create } from 'zustand'
import type { Payment, Item, DayItems } from '../types/items'

interface CalendarState {
  items: DayItems
}

interface CalendarActions {
  loadItems: (items: Item[]) => void
  setItem: (dateKey: string, item: Item) => void
  addPayment: (dateKey: string, payment: Payment) => void
  removePayments: (dateKey: string, ids: string[]) => void
  updatePayment: (dateKey: string, updatedItem: Item) => void
}

const initialState: CalendarState = {
  items: {},
}

const useCalendarStore = create<CalendarState & CalendarActions>((set) => ({
  ...initialState,

  loadItems: (items) =>
    set({
      items: Object.fromEntries(items.map((item) => [item.date.slice(0, 10), item])),
    }),

  setItem: (dateKey, item) =>
    set((state) => ({
      items: {
        ...state.items,
        [dateKey]: {
          ...item,
          payments: item.payments ?? state.items[dateKey]?.payments ?? [],
        },
      },
    })),

  addPayment: (dateKey, payment) =>
    set((state) => {
      const existing = state.items[dateKey]
      return {
        items: {
          ...state.items,
          [dateKey]: existing
            ? { ...existing, payments: [...existing.payments, payment] }
            : { id: crypto.randomUUID(), userId: '', date: dateKey, payments: [payment] },
        },
      }
    }),

  removePayments: (dateKey, ids) =>
    set((state) => {
      const existing = state.items[dateKey]
      if (!existing) return state
      return {
        items: {
          ...state.items,
          [dateKey]: { ...existing, payments: existing.payments.filter((p) => !ids.includes(p.id)) },
        },
      }
    }),

  updatePayment: (dateKey, updatedItem) =>
    set((state) => ({
      items: {
        ...state.items,
        [dateKey]: {
          ...updatedItem,
          payments: updatedItem.payments ?? state.items[dateKey]?.payments ?? [],
        },
      },
    })),
}))

export default useCalendarStore
