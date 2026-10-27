import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import {
  createStudentSchema,
  updateStudentSchema,
  type StudentFormInput,
  type StudentFormValues,
} from '../schemas/student.schema'
import type { Student, UpdateStudentRequest } from '../types'
import { useCreateStudent } from './useCreateStudent'
import { useUpdateStudent } from './useUpdateStudent'

const EMPTY_VALUES: StudentFormInput = {
  name: '',
  email: '',
  password: '',
  studentCode: '',
  program: '',
}

/**
 * Form state and submit logic for registering or editing a student. Editing
 * validates with the schema without password.
 * @param student - Student being edited; omit to register a new one.
 * @param isOpen - Whether the dialog is open; the form resets each time it opens.
 * @param onDone - Called after a successful save (closes the dialog).
 * @returns The RHF form, the submit handler and the pending flag.
 */
export function useStudentForm(student: Student | undefined, isOpen: boolean, onDone: () => void) {
  // The edit schema has no password; the shared form type keeps it empty, so the resolver is widened.
  const resolver = zodResolver(
    student ? updateStudentSchema : createStudentSchema,
  ) as unknown as Resolver<StudentFormInput, unknown, StudentFormValues>
  const form = useForm<StudentFormInput, unknown, StudentFormValues>({
    resolver,
    defaultValues: EMPTY_VALUES,
  })
  const { reset } = form
  const create = useCreateStudent(onDone)
  const update = useUpdateStudent(onDone)

  useEffect(() => {
    if (!isOpen) return
    reset(
      student
        ? {
            name: student.name,
            email: student.email,
            password: '',
            studentCode: student.studentCode,
            program: student.program,
          }
        : EMPTY_VALUES,
    )
  }, [isOpen, student, reset])

  const handleSubmit = form.handleSubmit((values) => {
    if (!student) {
      create.mutate(values)
      return
    }
    const { dirtyFields } = form.formState
    const payload: UpdateStudentRequest = {}
    if (dirtyFields.name) payload.name = values.name
    if (dirtyFields.email) payload.email = values.email
    if (dirtyFields.studentCode) payload.studentCode = values.studentCode
    if (dirtyFields.program) payload.program = values.program
    update.mutate({ id: student.id, payload })
  })

  return { form, handleSubmit, isPending: create.isPending || update.isPending }
}
