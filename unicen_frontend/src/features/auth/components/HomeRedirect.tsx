import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { getDefaultRouteByRole } from '../utils/role-navigation.utils'

/**
 * Redirects the root path to the landing route of the current role.
 */
export function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? getDefaultRouteByRole(user.role) : '/login'} replace />
}
