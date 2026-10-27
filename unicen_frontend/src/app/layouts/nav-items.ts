import { Role } from '@/shared/types'

export interface NavItem {
  to: string
  label: string
  roles: Role[]
}

/** Sidebar entries; each is visible only to the listed roles. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/subjects', label: 'Materias', roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
  { to: '/courses', label: 'Oferta de cursos', roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT] },
  { to: '/students', label: 'Estudiantes', roles: [Role.ADMIN] },
  { to: '/enrollments', label: 'Inscripciones', roles: [Role.ADMIN, Role.STUDENT] },
  { to: '/grades/history', label: 'Historial académico', roles: [Role.STUDENT] },
]
