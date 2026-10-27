import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { formatTerm } from '@/shared/lib/term.utils'
import { useAdminEnrollStudent } from '../hooks/useAdminEnrollStudent'
import { useEnrollCourseOptions } from '../hooks/useEnrollCourseOptions'
import { CourseOptionSelect } from './CourseOptionSelect'

interface AdminEnrollDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean
  /** Student profile id to enroll. */
  studentId: string
  /** Term whose offering is listed. */
  term: string
  /** Called when the dialog should close. */
  onClose: () => void
}

/**
 * Dialog for an ADMIN to enroll a student in a course of the selected term (HU-11).
 */
export function AdminEnrollDialog({ isOpen, studentId, term, onClose }: AdminEnrollDialogProps) {
  const [courseId, setCourseId] = useState('')
  const { data: options, isLoading, isError, refetch } = useEnrollCourseOptions(term, isOpen)

  const handleClose = () => {
    setCourseId('')
    onClose()
  }
  const enrollStudent = useAdminEnrollStudent(handleClose)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inscribir en curso</DialogTitle>
          <DialogDescription>
            Oferta de la {formatTerm(term).toLowerCase()}. Los cursos sin cupos no se pueden elegir.
          </DialogDescription>
        </DialogHeader>
        {isError && (
          <p role="alert" className="text-sm text-destructive">
            No pudimos cargar la oferta.{' '}
            <button type="button" className="underline" onClick={() => void refetch()}>
              Reintentar
            </button>
          </p>
        )}
        {options && options.length === 0 && (
          <p className="text-sm text-ink-muted">No hay cursos ofertados en esta gestión.</p>
        )}
        <CourseOptionSelect
          options={options ?? []}
          value={courseId}
          onChange={setCourseId}
          isDisabled={isLoading}
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={enrollStudent.isPending}>
            Cancelar
          </Button>
          <Button
            disabled={!courseId || enrollStudent.isPending}
            onClick={() => enrollStudent.mutate({ courseId, studentId })}
          >
            {enrollStudent.isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            Inscribir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
