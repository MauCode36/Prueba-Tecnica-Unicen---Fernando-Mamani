import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { createSubject } from '../services/subjects.service'
import { subjectsKeys } from './subjects.keys'

/**
 * Creates a subject and refreshes the catalog.
 * @param onSuccess - Called after the subject is created (closes the dialog).
 * @returns The create mutation.
 */
export function useCreateSubject(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectsKeys.all })
      toast.success('Materia creada')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
