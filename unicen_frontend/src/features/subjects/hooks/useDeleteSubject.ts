import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { deleteSubject } from '../services/subjects.service'
import { subjectsKeys } from './subjects.keys'

/**
 * Deletes a subject and refreshes the catalog. A subject with courses
 * answers 409 and the message is shown as a toast.
 * @param onSuccess - Called after the subject is deleted (closes the confirmation).
 * @returns The delete mutation.
 */
export function useDeleteSubject(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectsKeys.all })
      toast.success('Materia eliminada')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
