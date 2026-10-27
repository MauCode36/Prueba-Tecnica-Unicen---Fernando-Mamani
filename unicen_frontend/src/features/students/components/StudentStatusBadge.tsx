import { Badge } from '@/shared/components/ui/badge'

interface StudentStatusBadgeProps {
  /** Whether the student account is active. */
  isActive: boolean
}

/**
 * "Activo" / "Inactivo" pill for a student.
 */
export function StudentStatusBadge({ isActive }: StudentStatusBadgeProps) {
  return isActive ? (
    <Badge variant="secondary">Activo</Badge>
  ) : (
    <Badge variant="outline">Inactivo</Badge>
  )
}
