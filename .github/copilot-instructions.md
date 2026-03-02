# Copilot Instructions — ai-courses-app

## Architecture Overview

React 19 + TypeScript SPA built with Vite 6, MUI v6, and a strict feature-based folder layout.

| Folder | Role |
|---|---|
| `src/pages/` | Full-page route components; one file per route |
| `src/components/<domain>/` | Reusable components scoped to a feature/domain |
| `src/components/common/` | Shared layout components (navbar, sidebar) |
| `src/stores/` | Zustand stores; one store per domain |
| `src/services/` | Plain-fetch API clients; one file per API domain |
| `src/types/` | TypeScript interfaces and DTOs |
| `src/routes/` | React Router guard components |
| `src/styles/` | MUI theme |

## Tech Stack

| Concern | Library / Version |
|---|---|
| Framework | React 19, TypeScript 5.7, Vite 6 |
| UI | `@mui/material` v6, `@mui/icons-material` v6, `@mui/x-date-pickers` v8 |
| Routing | `react-router-dom` v7 |
| State | `zustand` v5 with `persist` middleware |
| Forms | `react-hook-form` v7 + `zod` v3 + `@hookform/resolvers` |
| Dates | `dayjs` + MUI `AdapterDayjs` |
| HTTP | Native `fetch` (no Axios) |

## Key Patterns

### MUI Imports
Always use deep sub-path imports — **never** barrel imports:
```tsx
// ✅ correct
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// ❌ wrong
import { Box, Typography } from '@mui/material'
```

### Styling
Use only the `sx` prop for styling — no `styled()`, no CSS modules, no `makeStyles`:
```tsx
<Box sx={{ display: 'flex', gap: 2, p: 3 }}>
```

Use theme tokens rather than hard-coded colors:
```tsx
sx={{ color: 'text.secondary', bgcolor: 'background.default' }}
```

Layout constants are exported from `src/app.tsx` and must be imported from there:
```tsx
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED } from '../../app'
```

### Components
- `export default function ComponentName()` — named function, default export
- Define TypeScript interfaces inline in the same file when small
- Functional components with hooks only; no class components

### Zustand Stores
Separate `State` and `Actions` interfaces; use `initialState` constant for easy reset.

Use `persist` with `partialize` **only** for stores that must survive page reload (e.g. auth tokens):
```ts
// Persisted store (auth)
const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({ ...initialState, logout: () => set(initialState) }),
    { name: 'ai-courses-auth', partialize: (s) => ({ accessToken: s.accessToken, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)
export default useAuthStore
```

Use plain `create()` (no `persist`) for transient UI/domain state:
```ts
// Non-persisted store (items/payments)
const useItemPaymentStore = create<ItemPaymentState & ItemPaymentActions>((set) => ({
  ...initialState,
  loadItems: (items) => set({ items: Object.fromEntries(items.map((i) => [i.date.slice(0, 10), i])) }),
}))
export default useItemPaymentStore
```

### API Services
Plain `fetch`, shared `handleResponse<T>` generic, typed error class, `BASE_URL` pointing to `/api/v1/<domain>` (proxied by Vite to `http://localhost:8080`).

**Auth service** — error class carries `validationErrors` for field-level server errors:
```ts
export class AuthApiError extends Error {
  constructor(message: string, public readonly validationErrors: ApiValidationError[] = [], public readonly statusCode = 400) {
    super(message)
    this.name = 'AuthApiError'
  }
}
```

**Domain services** — read the auth token directly from the store; use an `authHeader()` helper:
```ts
import useAuthStore from '../stores/auth-store'

export class ItemsApiError extends Error {
  constructor(message: string, public readonly statusCode = 400) {
    super(message)
    this.name = 'ItemsApiError'
  }
}

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> { /* ... */ }

// For endpoints that return 204 No Content:
async function handleNoContent(res: Response): Promise<void> {
  if (res.ok) return
  throw new ItemsApiError(`Request failed with status ${res.status}`, res.status)
}

export async function getItems(): Promise<Item[]> {
  const res = await fetch(BASE_URL, { headers: { ...authHeader() } })
  return handleResponse<Item[]>(res)
}

export async function deletePayment(itemId: string, paymentId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${itemId}/payments/${paymentId}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  })
  return handleNoContent(res)
}
```

### Forms
`react-hook-form` + `zod` schema + `zodResolver`; define `schema` and `type FormValues = z.infer<typeof schema>` at module level; map server validation errors back to fields via `setError`:
```tsx
const schema = z.object({ email: z.string().email() })
type FormValues = z.infer<typeof schema>

const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })
```

### Routing
- Routes defined in `src/app.tsx` using `<Routes>` / `<Route>`
- Layout shell (navbar + sidebar + main content) wraps protected routes under `path="/*"`; inner `<Routes>` handles sub-routes (`dashboard`, `graphs`)
- `ProtectedRoute` in `src/routes/protected-route.tsx` uses `<Outlet />` and redirects to `/login` (preserving `location.state.from`) when `isAuthenticated` is false
- To protect a route, nest it inside `<Route element={<ProtectedRoute />}>`:
```tsx
<Route element={<ProtectedRoute />}>
  <Route path="dashboard" element={<DashboardPage />} />
</Route>
```

### Date Handling
Scope `LocalizationProvider` per component (not global in `main.tsx`) unless multiple date pickers share context:
```tsx
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
```

## Adding a New Feature Checklist

1. Add TypeScript types/interfaces in `src/types/<domain>.ts`
2. Add API service in `src/services/<domain>-service.ts` following the `handleResponse` pattern
3. Add Zustand store in `src/stores/<domain>-store.ts` if state needs to persist or be shared
4. Add components in `src/components/<domain>/`
5. Add page component in `src/pages/<domain>-page.tsx`
6. Register the route in `src/app.tsx` and wrap with `<ProtectedRoute>` if authentication is required

## Developer Workflows

**Dev server (port 3000, `/api` proxied to `:8080`):**
```
npm run dev
```

**Type-check (no emit):**
```
npx tsc -p tsconfig.app.json --noEmit
```

**Build:**
```
npm run build
```

## Key Files

- [src/app.tsx](src/app.tsx) — routing, layout shell, exported layout constants
- [src/main.tsx](src/main.tsx) — entry point, global providers (`BrowserRouter` → `ThemeProvider` → `CssBaseline`)
- [src/styles/theme.ts](src/styles/theme.ts) — MUI theme (primary `#6366f1`, background `#f8fafc`)
- [src/pages/login-page.tsx](src/pages/login-page.tsx) — canonical page pattern (form + validation + API call)
- [src/pages/register-page.tsx](src/pages/register-page.tsx) — registration page pattern
- [src/stores/auth-store.ts](src/stores/auth-store.ts) — canonical persisted Zustand store pattern
- [src/stores/items-payments-store.ts](src/stores/items-payments-store.ts) — canonical non-persisted Zustand store (`useItemPaymentStore`)
- [src/services/auth-service.ts](src/services/auth-service.ts) — canonical auth API service pattern (with `validationErrors`)
- [src/services/items-service.ts](src/services/items-service.ts) — canonical authenticated domain service (`authHeader`, `handleNoContent`)
- [src/types/auth.ts](src/types/auth.ts) — auth types (`User`, `LoginResponse`, `ApiValidationError`)
- [src/types/items.ts](src/types/items.ts) — domain types (`Item`, `Payment`, `DayItems`) + utility functions
- [src/components/common/sidebar-nav.tsx](src/components/common/sidebar-nav.tsx) — canonical component pattern
- [src/routes/protected-route.tsx](src/routes/protected-route.tsx) — auth guard
