import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { Subject } from '../types'

interface SubjectRowActionsProps {
  /** Subject of the row. */
  subject: Subject
  /** Called to edit the subject. */
  onEdit: (subject: Subject) => void
  /** Called to delete the subject. */
  onDelete: (subject: Subject) => void
}

/**
 * Edit and delete buttons of a subject row (ADMIN only).
 */
export function SubjectRowActions({ subject, onEdit, onDelete }: SubjectRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Editar ${subject.name}`}
        onClick={() => onEdit(subject)}
      >
        <Pencil aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Eliminar ${subject.name}`}
        onClick={() => onDelete(subject)}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  )
}
