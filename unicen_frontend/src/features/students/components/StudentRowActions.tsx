import { Pencil, ListChecks } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import type { Student } from '../types'

interface StudentRowActionsProps {
  /** Student of the row. */
  student: Student
  /** Called to edit the student. */
  onEdit: (student: Student) => void
  /** Called to activate or deactivate the student. */
  onToggleStatus: (student: Student) => void
}

/**
 * Edit, enrollments link and activity switch of a student row.
 */
export function StudentRowActions({ student, onEdit, onToggleStatus }: StudentRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Ver inscripciones de ${student.name}`}
        render={<Link to={`/students/${student.id}/enrollments`} />}
        nativeButton={false}
      >
        <ListChecks aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Editar ${student.name}`} onClick={() => onEdit(student)}>
        <Pencil aria-hidden="true" />
      </Button>
      <Switch
        aria-label={student.isActive ? `Desactivar a ${student.name}` : `Activar a ${student.name}`}
        checked={student.isActive}
        onCheckedChange={() => onToggleStatus(student)}
        className="ml-2"
      />
    </div>
  )
}
