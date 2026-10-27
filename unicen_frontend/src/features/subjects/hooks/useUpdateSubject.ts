import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { updateSubject } from '../services/subjects.service'
import type { UpdateSubjectRequest } from '../types'
import { subjectsKeys } from './subjects.keys'

interface UpdateSubjectVariables {
  id: string
  payload: UpdateSubjectRequest
}

/**
 * Updates a subject and refreshes the catalog.
 * @param onSuccess - Called after the subject is updated (closes the dialog).
 * @returns The update mutation.
 */
export function useUpdateSubject(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateSubjectVariables) => updateSubject(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectsKeys.all })
      toast.success('Materia actualizada')
      onSuccess?.()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
