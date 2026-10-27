import { Role } from '@/shared/types'

/** Spanish labels shown in the UI for each role. */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Administrador',
  [Role.TEACHER]: 'Docente',
  [Role.STUDENT]: 'Estudiante',
}

const DEFAULT_ROUTE_BY_ROLE: Record<Role, string> = {
  [Role.ADMIN]: '/subjects',
  [Role.TEACHER]: '/courses/mine',
  [Role.STUDENT]: '/courses',
}

/**
 * Returns the landing route for a role after login.
 * @param role - Role of the authenticated user.
 * @returns The route path to navigate to.
 */
export function getDefaultRouteByRole(role: Role): string {
  return DEFAULT_ROUTE_BY_ROLE[role]
}
