import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { createStudent } from '../services/students.service'
import { studentsKeys } from './students.keys'

/**
 * Registers a student and refreshes the list.
 * @param onSuccess - Called after the student is created (closes the dialog).
 * @returns The create mutation.
 */
export function useCreateStudent(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success('Estudiante registrado')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
