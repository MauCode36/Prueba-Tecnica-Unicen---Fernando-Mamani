import { Navigate, Outlet, useLocation } from 'react-router'
import type { Role } from '@/shared/types'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  /** Allowed roles. When omitted, being authenticated is enough. */
  roles?: Role[]
}

/**
 * Route guard: sends anonymous users to /login and users without a
 * permitted role to /403. UX only; the API enforces real authorization.
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }
  return <Outlet />
}
