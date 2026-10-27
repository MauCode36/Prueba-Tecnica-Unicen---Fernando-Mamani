import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getSubjectOptions, getTeacherOptions } from '../services/course-options.service'
import type { CourseOptions, CourseTeacher } from '../types'
import { courseOptionsKeys } from './courses.keys'

async function getCourseOptions(): Promise<CourseOptions> {
  const [subjects, teachers] = await Promise.all([getSubjectOptions(), getTeacherOptions()])
  return { subjects, teachers }
}

/**
 * Loads the subject and teacher options of the course form. It runs only while
 * the dialog is open and refetches on every open, so a subject created
 * moments ago shows up (subjects cannot invalidate course queries).
 * @param isOpen - Whether the form dialog is open.
 * @param currentTeacher - Teacher of the course being edited; kept in the list
 * even when inactive so the select is not left empty.
 * @returns The options query with the teacher list completed.
 */
export function useCourseOptions(isOpen: boolean, currentTeacher?: CourseTeacher) {
  const query = useQuery({
    queryKey: courseOptionsKeys.all,
    queryFn: getCourseOptions,
    enabled: isOpen,
    refetchOnMount: 'always',
    staleTime: 0,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    const hasCurrent =
      !currentTeacher || query.data.teachers.some((option) => option.value === currentTeacher.id)
    if (hasCurrent) return query.data
    return {
      ...query.data,
      teachers: [...query.data.teachers, { value: currentTeacher.id, label: currentTeacher.name }],
    }
  }, [query.data, currentTeacher])

  return { ...query, data }
}
