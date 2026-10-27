import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { createCourse } from '../services/courses.service'
import { coursesKeys } from './courses.keys'

/**
 * Creates a course and refreshes the offering.
 * @param onSuccess - Called after the course is created (closes the dialog).
 * @returns The create mutation.
 */
export function useCreateCourse(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coursesKeys.all })
      toast.success('Curso creado')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
