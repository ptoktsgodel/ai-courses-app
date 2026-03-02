import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginResponse } from '../types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
}

interface AuthActions {
  setTokens: (tokens: Pick<LoginResponse, 'accessToken' | 'refreshToken'>) => void
  setUser: (user: User) => void
  logout: () => void
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
}

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      logout: () => set(initialState),
    }),
    {
      name: 'ai-courses-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
