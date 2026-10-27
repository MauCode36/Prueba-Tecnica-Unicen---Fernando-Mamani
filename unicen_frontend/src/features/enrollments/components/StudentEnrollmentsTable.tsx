import { Badge } from '@/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatDate } from '@/shared/lib/date.utils'
import { EnrollmentStatus, type EnrollmentSummary } from '../types'
import { CancelEnrollmentButton } from './CancelEnrollmentButton'

interface StudentEnrollmentsTableProps {
  /** Active and cancelled enrollments of the student in the term. */
  enrollments: EnrollmentSummary[]
}

/**
 * ADMIN view of a student's enrollments; only active ones can be cancelled.
 */
export function StudentEnrollmentsTable({ enrollments }: StudentEnrollmentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Materia</TableHead>
          <TableHead>Paralelo</TableHead>
          <TableHead>Docente</TableHead>
          <TableHead>Inscripción</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-28">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => {
          const isActive = enrollment.status === EnrollmentStatus.ACTIVE
          return (
            <TableRow key={enrollment.id}>
              <TableCell>
                <span className="font-medium">{enrollment.course.subject.code}</span> ·{' '}
                {enrollment.course.subject.name}
              </TableCell>
              <TableCell>{enrollment.course.section}</TableCell>
              <TableCell>{enrollment.course.teacher.name}</TableCell>
              <TableCell>{formatDate(enrollment.enrolledAt)}</TableCell>
              <TableCell>
                <Badge variant={isActive ? 'secondary' : 'outline'}>
                  {isActive ? 'Activa' : 'Cancelada'}
                </Badge>
              </TableCell>
              <TableCell>
                {isActive && <CancelEnrollmentButton enrollment={enrollment} isOwn={false} />}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
