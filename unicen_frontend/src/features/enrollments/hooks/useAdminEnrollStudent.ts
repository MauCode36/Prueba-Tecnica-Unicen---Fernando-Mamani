import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { enroll } from '../services/enrollments.service'
import type { CreateEnrollmentRequest } from '../types'
import { invalidateEnrollmentQueries } from './invalidate-enrollment-queries'

/**
 * Enrolls a student in a course on behalf of an ADMIN (HU-11). It runs the
 * same backend validations as a student's own enrollment.
 * @param onSuccess - Called after the enrollment (closes the dialog).
 * @returns The enroll mutation, called with the course and student ids.
 */
export function useAdminEnrollStudent(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Required<CreateEnrollmentRequest>) => enroll(payload),
    onSuccess: () => {
      toast.success('Estudiante inscrito')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
    onSettled: () => invalidateEnrollmentQueries(queryClient),
  })
}
