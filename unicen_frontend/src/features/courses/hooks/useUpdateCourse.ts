import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { updateCourse } from '../services/courses.service'
import type { UpdateCourseRequest } from '../types'
import { coursesKeys } from './courses.keys'

interface UpdateCourseVariables {
  id: string
  payload: UpdateCourseRequest
}

/**
 * Updates a course and refreshes the offering. A capacity below the
 * enrollments answers 409 and the message is shown as a toast.
 * @param onSuccess - Called after the course is updated (closes the dialog).
 * @returns The update mutation.
 */
export function useUpdateCourse(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCourseVariables) => updateCourse(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coursesKeys.all })
      toast.success('Curso actualizado')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
