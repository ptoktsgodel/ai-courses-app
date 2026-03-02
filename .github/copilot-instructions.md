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
Separate `State` and `Actions` interfaces; use `initialState` constant for easy reset; always use `persist` with `partialize` for auth-related stores:
```ts
interface MyState { value: string | null }
interface MyActions { setValue: (v: string) => void; reset: () => void }
const initialState: MyState = { value: null }

const useMyStore = create<MyState & MyActions>()(
  persist(
    (set) => ({
      ...initialState,
      setValue: (value) => set({ value }),
      reset: () => set(initialState),
    }),
    { name: 'ai-courses-my', partialize: (s) => ({ value: s.value }) }
  )
)
export default useMyStore
```

### API Services
Plain `fetch`, shared `handleResponse<T>` generic, typed error class, `BASE_URL` pointing to `/api/v1/<domain>` (proxied by Vite to `http://localhost:8080`):
```ts
const BASE_URL = '/api/v1/my-domain'

export class MyApiError extends Error {
  constructor(message: string, public readonly validationErrors: ApiValidationError[] = [], public readonly statusCode = 400) {
    super(message)
    this.name = 'MyApiError'
  }
}

async function handleResponse<T>(res: Response): Promise<T> { /* ... */ }

export async function getItems(): Promise<ItemDto[]> {
  const res = await fetch(`${BASE_URL}/items`, { headers: { Authorization: `Bearer ${token}` } })
  return handleResponse<ItemDto[]>(res)
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
- Layout shell (navbar + sidebar + main content) wraps protected routes under `path="/*"`
- `ProtectedRoute` in `src/routes/protected-route.tsx` uses `<Outlet />` and redirects to `/login` when `isAuthenticated` is false
- To protect a route, nest it inside `<Route element={<ProtectedRoute />}>`

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
- [src/stores/auth-store.ts](src/stores/auth-store.ts) — canonical Zustand store pattern
- [src/services/auth-service.ts](src/services/auth-service.ts) — canonical API service pattern
- [src/components/common/sidebar-nav.tsx](src/components/common/sidebar-nav.tsx) — canonical component pattern
- [src/routes/protected-route.tsx](src/routes/protected-route.tsx) — auth guard
