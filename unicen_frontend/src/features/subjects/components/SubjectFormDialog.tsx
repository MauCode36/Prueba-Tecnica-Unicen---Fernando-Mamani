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
import { useSubjectForm } from '../hooks/useSubjectForm'
import type { Subject } from '../types'
import { SubjectFormFields } from './SubjectFormFields'

interface SubjectFormDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean
  /** Subject to edit; omit to create a new one. */
  subject?: Subject
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Dialog to create a subject, or edit one when `subject` is given.
 */
export function SubjectFormDialog({ isOpen, subject, onClose }: SubjectFormDialogProps) {
  const { form, handleSubmit, isPending } = useSubjectForm(subject, isOpen, onClose)
  const isEditing = !!subject

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar materia' : 'Nueva materia'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos de la materia.'
              : 'Registra una materia en el catálogo académico.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <SubjectFormFields form={form} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {isEditing ? 'Guardar cambios' : 'Crear materia'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
