import { httpClient } from '@/shared/api/httpClient'
import type {
  CreateEnrollmentRequest,
  Enrollment,
  EnrollmentsFilters,
  EnrollmentSummary,
} from '../types'

/**
 * Enrolls the current student, or any student when called by ADMIN.
 * @param payload - Course and, for ADMIN, the student profile id.
 * @returns The created enrollment.
 * @throws {AxiosError} When the course is full (409), already enrolled (409) or the student is inactive (409).
 */
export async function enroll(payload: CreateEnrollmentRequest): Promise<Enrollment> {
  const { data } = await httpClient.post<Enrollment>('/enrollments', payload)
  return data
}

/**
 * Lists the active enrollments of the authenticated student.
 * @param term - Optional term filter.
 * @returns The student's enrollments.
 * @throws {AxiosError} When the term is malformed (400) or the user is not a student (403).
 */
export async function getMyEnrollments(term?: string): Promise<EnrollmentSummary[]> {
  const { data } = await httpClient.get<EnrollmentSummary[]>('/enrollments/mine', {
    params: { term },
  })
  return data
}

/**
 * Lists enrollments of any student (ADMIN).
 * @param filters - Student, course, term and status filters.
 * @returns Matching enrollments, active and cancelled.
 * @throws {AxiosError} When a filter is malformed (400) or the user is not ADMIN (403).
 */
export async function getEnrollments(filters: EnrollmentsFilters): Promise<EnrollmentSummary[]> {
  const { data } = await httpClient.get<EnrollmentSummary[]>('/enrollments', { params: filters })
  return data
}

/**
 * Cancels an enrollment, which frees the seat.
 * @param id - Enrollment identifier.
 * @returns The cancelled enrollment.
 * @throws {AxiosError} When it is already cancelled (409), has grades (409) or is not the user's (403).
 */
export async function cancelEnrollment(id: string): Promise<Enrollment> {
  const { data } = await httpClient.patch<Enrollment>(`/enrollments/${id}/cancel`)
  return data
}
