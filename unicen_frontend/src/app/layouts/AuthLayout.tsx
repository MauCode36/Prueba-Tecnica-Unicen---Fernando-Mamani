import { Outlet } from 'react-router'

/**
 * Bare layout for unauthenticated screens; each page owns its composition.
 */
export function AuthLayout() {
  return <Outlet />
}
