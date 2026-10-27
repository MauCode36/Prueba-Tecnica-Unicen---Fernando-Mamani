import { LoaderCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useStudentForm } from '../hooks/useStudentForm'
import type { Student } from '../types'
import { StudentFormFields } from './StudentFormFields'

interface StudentFormDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean
  /** Student to edit; omit to register a new one. */
  student?: Student
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Dialog to register a student, or edit one when `student` is given.
 */
export function StudentFormDialog({ isOpen, student, onClose }: StudentFormDialogProps) {
  const { form, handleSubmit, isPending } = useStudentForm(student, isOpen, onClose)
  const isEditing = !!student

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar estudiante' : 'Nuevo estudiante'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del estudiante.'
              : 'Crea la cuenta y el perfil académico del estudiante.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <StudentFormFields form={form} hasPassword={!isEditing} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {isEditing ? 'Guardar cambios' : 'Registrar estudiante'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
