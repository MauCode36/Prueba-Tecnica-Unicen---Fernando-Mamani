import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  courseSchema,
  type CourseFormInput,
  type CourseFormValues,
} from '../schemas/course.schema'
import type { Course, UpdateCourseRequest } from '../types'
import { useCreateCourse } from './useCreateCourse'
import { useUpdateCourse } from './useUpdateCourse'

/**
 * Form state and submit logic for creating or editing a course.
 * @param course - Course being edited; omit to create a new one.
 * @param defaultTerm - Term preselected when creating.
 * @param isOpen - Whether the dialog is open; the form resets each time it opens.
 * @param onDone - Called after a successful save (closes the dialog).
 * @returns The RHF form, the submit handler and the pending flag.
 */
export function useCourseForm(
  course: Course | undefined,
  defaultTerm: string,
  isOpen: boolean,
  onDone: () => void,
) {
  const form = useForm<CourseFormInput, unknown, CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { subjectId: '', teacherId: '', term: defaultTerm, section: '', maxCapacity: '' },
  })
  const { reset } = form
  const create = useCreateCourse(onDone)
  const update = useUpdateCourse(onDone)

  useEffect(() => {
    if (!isOpen) return
    reset(
      course
        ? {
            subjectId: course.subject.id,
            teacherId: course.teacher.id,
            term: course.term,
            section: course.section,
            maxCapacity: course.maxCapacity,
          }
        : { subjectId: '', teacherId: '', term: defaultTerm, section: '', maxCapacity: '' },
    )
  }, [isOpen, course, defaultTerm, reset])

  const handleSubmit = form.handleSubmit((values) => {
    if (!course) {
      create.mutate(values)
      return
    }
    const { dirtyFields } = form.formState
    const payload: UpdateCourseRequest = {}
    if (dirtyFields.subjectId) payload.subjectId = values.subjectId
    if (dirtyFields.teacherId) payload.teacherId = values.teacherId
    if (dirtyFields.term) payload.term = values.term
    if (dirtyFields.section) payload.section = values.section
    if (dirtyFields.maxCapacity) payload.maxCapacity = values.maxCapacity
    update.mutate({ id: course.id, payload })
  })

  return { form, handleSubmit, isPending: create.isPending || update.isPending }
}
