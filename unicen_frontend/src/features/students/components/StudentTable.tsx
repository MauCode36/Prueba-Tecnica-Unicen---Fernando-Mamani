import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { Student } from '../types'
import { StudentRowActions } from './StudentRowActions'
import { StudentStatusBadge } from './StudentStatusBadge'

interface StudentTableProps {
  /** Students to list. */
  students: Student[]
  /** Called to edit a student. */
  onEdit: (student: Student) => void
  /** Called to activate or deactivate a student. */
  onToggleStatus: (student: Student) => void
}

/**
 * Students table: code, name, email, program, status and actions.
 */
export function StudentTable({ students, onEdit, onToggleStatus }: StudentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Carrera</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-44">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium">{student.studentCode}</TableCell>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>{student.program}</TableCell>
            <TableCell>
              <StudentStatusBadge isActive={student.isActive} />
            </TableCell>
            <TableCell>
              <StudentRowActions student={student} onEdit={onEdit} onToggleStatus={onToggleStatus} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
