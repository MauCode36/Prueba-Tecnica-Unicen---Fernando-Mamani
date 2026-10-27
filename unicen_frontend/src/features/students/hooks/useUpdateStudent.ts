import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { updateStudent } from '../services/students.service'
import type { UpdateStudentRequest } from '../types'
import { studentsKeys } from './students.keys'

interface UpdateStudentVariables {
  id: string
  payload: UpdateStudentRequest
}

/**
 * Updates a student and refreshes the list.
 * @param onSuccess - Called after the student is updated (closes the dialog).
 * @returns The update mutation.
 */
export function useUpdateStudent(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateStudentVariables) => updateStudent(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success('Estudiante actualizado')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
