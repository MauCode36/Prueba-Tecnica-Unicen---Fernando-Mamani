import { httpClient } from '@/shared/api/httpClient'
import type { SelectOption } from '../types'

interface SubjectItem {
  id: string
  code: string
  name: string
}

interface TeacherItem {
  id: string
  name: string
  isActive: boolean
}

/**
 * Loads subjects as select options. Kept here instead of importing the
 * subjects feature, which is off limits (see FD-011).
 * @returns Options labeled `CODE · Name`.
 * @throws {AxiosError} When the request fails.
 */
export async function getSubjectOptions(): Promise<SelectOption[]> {
  const { data } = await httpClient.get<SubjectItem[]>('/subjects')
  return data.map((subject) => ({ value: subject.id, label: `${subject.code} · ${subject.name}` }))
}

/**
 * Loads active teachers as select options. The API also returns inactive
 * teachers, which it rejects when assigned to a course.
 * @returns Options labeled with the teacher name.
 * @throws {AxiosError} When the request fails or the user is not ADMIN (403).
 */
export async function getTeacherOptions(): Promise<SelectOption[]> {
  const { data } = await httpClient.get<TeacherItem[]>('/users', { params: { role: 'TEACHER' } })
  return data
    .filter((teacher) => teacher.isActive)
    .map((teacher) => ({ value: teacher.id, label: teacher.name }))
}
