import { createContext } from 'react'
import type { AuthUser } from '../types'

/**
 * Shape of the global session state exposed by `AuthProvider`.
 */
export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  updateUser: (user: AuthUser) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
