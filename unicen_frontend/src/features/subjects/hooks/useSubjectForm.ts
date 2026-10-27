import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  subjectSchema,
  type SubjectFormInput,
  type SubjectFormValues,
} from '../schemas/subject.schema'
import type { Subject, UpdateSubjectRequest } from '../types'
import { useCreateSubject } from './useCreateSubject'
import { useUpdateSubject } from './useUpdateSubject'

const EMPTY_VALUES: SubjectFormInput = { code: '', name: '', credits: '' }

/**
 * Form state and submit logic for creating or editing a subject.
 * @param subject - Subject being edited; omit to create a new one.
 * @param isOpen - Whether the dialog is open; the form resets each time it opens.
 * @param onDone - Called after a successful save (closes the dialog).
 * @returns The RHF form, the submit handler and the pending flag.
 */
export function useSubjectForm(subject: Subject | undefined, isOpen: boolean, onDone: () => void) {
  const form = useForm<SubjectFormInput, unknown, SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: EMPTY_VALUES,
  })
  const { reset } = form
  const create = useCreateSubject(onDone)
  const update = useUpdateSubject(onDone)

  useEffect(() => {
    if (!isOpen) return
    reset(
      subject
        ? { code: subject.code, name: subject.name, credits: subject.credits }
        : EMPTY_VALUES,
    )
  }, [isOpen, subject, reset])

  const handleSubmit = form.handleSubmit((values) => {
    if (!subject) {
      create.mutate(values)
      return
    }
    const { dirtyFields } = form.formState
    const payload: UpdateSubjectRequest = {}
    if (dirtyFields.code) payload.code = values.code
    if (dirtyFields.name) payload.name = values.name
    if (dirtyFields.credits) payload.credits = values.credits
    update.mutate({ id: subject.id, payload })
  })

  return { form, handleSubmit, isPending: create.isPending || update.isPending }
}
