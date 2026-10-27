import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatDate } from '@/shared/lib/date.utils'
import type { EnrollmentSummary } from '../types'
import { CancelEnrollmentButton } from './CancelEnrollmentButton'

interface MyEnrollmentsTableProps {
  /** Active enrollments of the term. */
  enrollments: EnrollmentSummary[]
}

/**
 * The student's own enrollments, each with a cancel action.
 */
export function MyEnrollmentsTable({ enrollments }: MyEnrollmentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Materia</TableHead>
          <TableHead>Paralelo</TableHead>
          <TableHead>Docente</TableHead>
          <TableHead className="text-right">Créditos</TableHead>
          <TableHead>Inscripción</TableHead>
          <TableHead className="w-28">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => (
          <TableRow key={enrollment.id}>
            <TableCell>
              <span className="font-medium">{enrollment.course.subject.code}</span> ·{' '}
              {enrollment.course.subject.name}
            </TableCell>
            <TableCell>{enrollment.course.section}</TableCell>
            <TableCell>{enrollment.course.teacher.name}</TableCell>
            <TableCell className="text-right">{enrollment.course.subject.credits}</TableCell>
            <TableCell>{formatDate(enrollment.enrolledAt)}</TableCell>
            <TableCell>
              <CancelEnrollmentButton enrollment={enrollment} isOwn />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
