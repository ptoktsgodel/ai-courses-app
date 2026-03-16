# Scaffold a New React Project Using Vite

**Role:** Senior React Developer

## Tech Stack

- **React 19+** (Functional Components, Hooks)
- **Vite** (latest stable version)
- **Material UI** (configured theme palette)
- **TypeScript**
- **Zustand** — global auth state with `persist` middleware
- **React Hook Form** + **Zod** — form handling and validation
- **React Router** — client-side routing

## File Naming Convention

Use **kebab-case** for all files and folders.

Examples: `user-profile.tsx`, `auth-service.ts`, `api-services/`

## Folder Structure

```
src/
  components/
    common/         # Shared layout components
  hooks/            # Custom React hooks
  pages/            # Page-level components
  routes/           # Route guards and route definitions
  services/         # API call logic
  stores/           # Zustand stores
  styles/           # MUI theme and global styles
  types/            # Shared TypeScript interfaces
```

## Entry Point

- Clean `app.tsx` and `main.tsx`
- Wrap the app with `BrowserRouter`, MUI `ThemeProvider`, and `CssBaseline`
- Default route redirects to `/dashboard`

## Layout Components

### Top Navbar — `src/components/common/top-navbar.tsx`

1. Pinned to the top with a subtle shadow or bottom border (`AppBar position="fixed"`)
2. **Left section:** placeholder logo avatar and the app name
3. **Right section:**
   - Unauthenticated: "Login" (outline style) and "Register" (solid/primary style) buttons linking to their pages
   - Authenticated: "Logout" button that clears the auth store and navigates to `/login`

### Sidebar — `src/components/common/sidebar-nav.tsx`

1. Full-height permanent `Drawer` with a fixed width
2. **Top section:** "Dashboard" and "Graphs" menu items with corresponding MUI icons; each links to its route
3. **Bottom section:** "Settings" item pushed to the bottom
4. **Collapse/Expand:** toggle button in the header; collapsed sidebar shows only icons without text labels
5. Collapsed width: 64 px; expanded width: 240 px; transition animated

## Pages

### Dashboard — `src/pages/dashboard-page.tsx`
Accessible to all users (no auth required). Default landing page.

### Graphs — `src/pages/graphs-page.tsx`
Accessible to all users. Stub placeholder.

### Login — `src/pages/login-page.tsx`
- Fields: `email`, `password`
- Client-side Zod validation matching API rules
- On success: store tokens in Zustand auth store, redirect to `/dashboard`
- Display field-level errors from both Zod and the API validation error array
- Link to Register page

### Register — `src/pages/register-page.tsx`
- Fields: `firstName`, `lastName`, `email`, `password`, `confirmPassword`
- Password rules: min 8 chars, ≥1 uppercase, ≥1 digit, ≥1 special character
- `confirmPassword` must match `password`
- On success: redirect to `/login`
- Display field-level errors from both Zod and the API validation error array
- Link to Login page

## Authentication

- **Auth store** (`src/stores/auth-store.ts`): Zustand store with `persist` middleware saving `accessToken`, `refreshToken`, `user`, `isAuthenticated` to `localStorage`
- **Auth service** (`src/services/auth-service.ts`): fetch wrappers for `POST /api/v1/auth/login` and `POST /api/v1/auth/register`; typed error class surfacing API validation error arrays
- **Protected route** (`src/routes/protected-route.tsx`): redirects to `/login` with `state.from` when `isAuthenticated` is false

## API Integration

- Backend: `ai-courses-api` running at `http://localhost:5255`
- Configure Vite dev proxy: `/api` → `http://localhost:5255` (avoids CORS — no CORS config on the API)
- Login endpoint: `POST /api/v1/auth/login` — request `{ email, password }` — response `{ accessToken, refreshToken, tokenType, expiresIn }`
- Register endpoint: `POST /api/v1/auth/register` — request `{ email, password, confirmPassword, firstName, lastName }` — response `{ id, email, firstName, lastName }`
- Send `Authorization: Bearer <accessToken>` header on authenticated requests

## MUI Theme

Configure a custom `createTheme` with:
- Custom `primary` and `secondary` palette colors
- Custom `background` colors
- Consistent `borderRadius` and `typography.fontFamily`
- Button `textTransform: none` override
