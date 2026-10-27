import { httpClient } from '@/shared/api/httpClient'
import type {
  Course,
  CoursesFilters,
  CreateCourseRequest,
  EnrolledStudent,
  UpdateCourseRequest,
} from '../types'

/**
 * Lists the course offering.
 * @param filters - Optional term and subject filters.
 * @returns Courses with seats and `isEnrolled` for the current student.
 * @throws {AxiosError} When the term is malformed (400).
 */
export async function getCourses(filters: CoursesFilters): Promise<Course[]> {
  const { data } = await httpClient.get<Course[]>('/courses', { params: filters })
  return data
}

/**
 * Lists the courses assigned to the authenticated teacher.
 * @returns The teacher's courses.
 * @throws {AxiosError} When the user is not a teacher (403).
 */
export async function getMyCourses(): Promise<Course[]> {
  const { data } = await httpClient.get<Course[]>('/courses/mine')
  return data
}

/**
 * Fetches a course.
 * @param id - Course identifier.
 * @returns The course.
 * @throws {AxiosError} When the id is invalid (400) or the course does not exist (404).
 */
export async function getCourse(id: string): Promise<Course> {
  const { data } = await httpClient.get<Course>(`/courses/${id}`)
  return data
}

/**
 * Lists the students enrolled in a course.
 * @param id - Course identifier.
 * @returns Enrolled students ordered by name.
 * @throws {AxiosError} When the user is not the course teacher (403) or the course is missing (404).
 */
export async function getEnrolledStudents(id: string): Promise<EnrolledStudent[]> {
  const { data } = await httpClient.get<EnrolledStudent[]>(`/courses/${id}/enrolled-students`)
  return data
}

/**
 * Creates a course offering.
 * @param payload - Course data.
 * @returns The created course.
 * @throws {AxiosError} On a duplicate course (409), invalid teacher (400) or missing subject (404).
 */
export async function createCourse(payload: CreateCourseRequest): Promise<Course> {
  const { data } = await httpClient.post<Course>('/courses', payload)
  return data
}

/**
 * Updates a course.
 * @param id - Course identifier.
 * @param payload - Fields to change.
 * @returns The updated course.
 * @throws {AxiosError} On a duplicate (409) or when the capacity is below the enrollments (409).
 */
export async function updateCourse(id: string, payload: UpdateCourseRequest): Promise<Course> {
  const { data } = await httpClient.patch<Course>(`/courses/${id}`, payload)
  return data
}

/**
 * Deletes a course.
 * @param id - Course identifier.
 * @throws {AxiosError} When the course has enrollments (409).
 */
export async function deleteCourse(id: string): Promise<void> {
  await httpClient.delete(`/courses/${id}`)
}
