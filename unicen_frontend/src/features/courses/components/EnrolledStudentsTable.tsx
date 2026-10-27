import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatDate } from '@/shared/lib/date.utils'
import type { EnrolledStudent } from '../types'

interface EnrolledStudentsTableProps {
  /** Students with an active enrollment in the course. */
  students: EnrolledStudent[]
}

/**
 * Enrolled students: code, name, email, program and enrollment date.
 */
export function EnrolledStudentsTable({ students }: EnrolledStudentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Carrera</TableHead>
          <TableHead>Inscripción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.enrollmentId}>
            <TableCell className="font-medium">{student.studentCode}</TableCell>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>{student.program}</TableCell>
            <TableCell>{formatDate(student.enrolledAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
