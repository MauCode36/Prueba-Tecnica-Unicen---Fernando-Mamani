import { httpClient } from '@/shared/api/httpClient'
import type { EnrollCourseOption } from '../types'

interface OfferedCourse {
  id: string
  section: string
  availableSeats: number
  subject: { code: string; name: string }
}

/**
 * Loads the term offering as select options for the admin enroll dialog.
 * The call is kept here instead of importing the courses feature, which
 * already depends on this one (see FD-016).
 * @param term - Term to list.
 * @returns Options labeled `CODE SECTION · Name — N cupos`; full courses are disabled.
 * @throws {AxiosError} When the term is malformed (400).
 */
export async function getEnrollCourseOptions(term: string): Promise<EnrollCourseOption[]> {
  const { data } = await httpClient.get<OfferedCourse[]>('/courses', { params: { term } })
  return data.map((course) => ({
    value: course.id,
    label: `${course.subject.code} ${course.section} · ${course.subject.name} — ${
      course.availableSeats === 0 ? 'sin cupos' : `${course.availableSeats} cupos`
    }`,
    isDisabled: course.availableSeats === 0,
  }))
}
