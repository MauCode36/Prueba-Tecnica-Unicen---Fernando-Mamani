import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../context/auth-context'

/**
 * Reads the global session state.
 * @returns The auth context value.
 * @throws {Error} When used outside `AuthProvider`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
