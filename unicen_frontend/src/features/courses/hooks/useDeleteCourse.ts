import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { deleteCourse } from '../services/courses.service'
import { coursesKeys } from './courses.keys'

/**
 * Deletes a course and refreshes the offering. A course with enrollments
 * answers 409 and the message is shown as a toast.
 * @param onSuccess - Called after the course is deleted (closes the confirmation).
 * @returns The delete mutation.
 */
export function useDeleteCourse(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coursesKeys.all })
      toast.success('Curso eliminado')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
