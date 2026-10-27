import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { cancelEnrollment } from '../services/enrollments.service'
import { invalidateEnrollmentQueries } from './invalidate-enrollment-queries'

/**
 * Cancels an enrollment and refreshes lists and course seats. A cancelled or
 * graded enrollment answers 409 and the message is shown as a toast.
 * @param onSuccess - Called after the cancellation (closes the confirmation).
 * @returns The cancel mutation, called with the enrollment id.
 */
export function useCancelEnrollment(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelEnrollment,
    onSuccess: () => {
      toast.success('Inscripción cancelada')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
    onSettled: () => invalidateEnrollmentQueries(queryClient),
  })
}
