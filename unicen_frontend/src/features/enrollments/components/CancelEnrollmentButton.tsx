import { useState } from 'react'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Button } from '@/shared/components/ui/button'
import { useCancelEnrollment } from '../hooks/useCancelEnrollment'
import type { EnrollmentSummary } from '../types'
import { formatCourseLabel } from '../utils/enrollment.utils'

interface CancelEnrollmentButtonProps {
  /** Enrollment to cancel. */
  enrollment: EnrollmentSummary
  /** True when the student cancels their own enrollment; changes the wording. */
  isOwn: boolean
}

/**
 * "Cancelar" button that asks for confirmation before freeing the seat.
 */
export function CancelEnrollmentButton({ enrollment, isOwn }: CancelEnrollmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const cancel = useCancelEnrollment(() => setIsOpen(false))
  const label = formatCourseLabel(enrollment.course)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Cancelar
      </Button>
      <ConfirmDialog
        isOpen={isOpen}
        title="Cancelar inscripción"
        description={
          isOwn
            ? `¿Cancelar tu inscripción en ${label}? Se liberará tu cupo.`
            : `¿Cancelar la inscripción de ${enrollment.student.name} en ${label}? Se liberará el cupo.`
        }
        confirmLabel="Cancelar inscripción"
        isPending={cancel.isPending}
        onConfirm={() => cancel.mutate(enrollment.id)}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
