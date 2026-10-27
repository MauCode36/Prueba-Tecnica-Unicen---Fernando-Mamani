import { Pencil, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import type { Course } from '../types'

interface CourseRowActionsProps {
  /** Course of the row. */
  course: Course
  /** Called to edit the course. */
  onEdit: (course: Course) => void
  /** Called to delete the course. */
  onDelete: (course: Course) => void
}

/**
 * View enrolled students, edit and delete buttons of a course row (ADMIN only).
 */
export function CourseRowActions({ course, onEdit, onDelete }: CourseRowActionsProps) {
  const name = `${course.subject.code} paralelo ${course.section}`

  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Ver inscritos de ${name}`}
        render={<Link to={`/courses/${course.id}/students`} />}
        nativeButton={false}
      >
        <Users aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Editar ${name}`} onClick={() => onEdit(course)}>
        <Pencil aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Eliminar ${name}`}
        onClick={() => onDelete(course)}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  )
}
