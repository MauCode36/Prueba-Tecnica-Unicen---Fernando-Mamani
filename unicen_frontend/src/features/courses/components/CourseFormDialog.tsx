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
import { useCourseForm } from '../hooks/useCourseForm'
import { useCourseOptions } from '../hooks/useCourseOptions'
import type { Course } from '../types'
import { CourseFormFields } from './CourseFormFields'

interface CourseFormDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean
  /** Course to edit; omit to create a new one. */
  course?: Course
  /** Term preselected when creating. */
  defaultTerm: string
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Dialog to create a course offering, or edit one when `course` is given.
 */
export function CourseFormDialog({ isOpen, course, defaultTerm, onClose }: CourseFormDialogProps) {
  const { form, handleSubmit, isPending } = useCourseForm(course, defaultTerm, isOpen, onClose)
  const { data: options, isError, refetch } = useCourseOptions(isOpen, course?.teacher)
  const isEditing = !!course

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar curso' : 'Nuevo curso'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del curso.'
              : 'Abre un paralelo de una materia en una gestión.'}
          </DialogDescription>
        </DialogHeader>
        {isError && (
          <p role="alert" className="text-sm text-destructive">
            No pudimos cargar materias y docentes.{' '}
            <button type="button" className="underline" onClick={() => void refetch()}>
              Reintentar
            </button>
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <CourseFormFields form={form} options={options} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {isEditing ? 'Guardar cambios' : 'Crear curso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
