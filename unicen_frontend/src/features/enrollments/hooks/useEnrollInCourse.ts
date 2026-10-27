import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { enroll } from '../services/enrollments.service'
import { invalidateEnrollmentQueries } from './invalidate-enrollment-queries'

/**
 * Enrolls the current student in a course. There is no optimistic update:
 * the backend decides seats and duplicates, and its 409 message is shown.
 * Seats are refreshed on failure too, since another enrollment may have won.
 * @returns The enroll mutation, called with the course id.
 */
export function useEnrollInCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => enroll({ courseId }),
    onSuccess: () => toast.success('Inscripción realizada'),
    onError: (error) => toast.error(getApiErrorMessage(error)),
    onSettled: () => invalidateEnrollmentQueries(queryClient),
  })
}
