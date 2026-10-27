import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { updateStudentStatus } from '../services/students.service'
import { studentsKeys } from './students.keys'

interface UpdateStudentStatusVariables {
  id: string
  isActive: boolean
}

/**
 * Activates or deactivates a student and refreshes the list.
 * @param onSuccess - Called after the change (closes the confirmation).
 * @returns The status mutation.
 */
export function useUpdateStudentStatus(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: UpdateStudentStatusVariables) => updateStudentStatus(id, isActive),
    onSuccess: (student) => {
      void queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(student.isActive ? 'Estudiante activado' : 'Estudiante desactivado')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
