import { httpClient } from '@/shared/api/httpClient'
import type {
  CreateStudentRequest,
  Student,
  StudentsFilters,
  UpdateStudentRequest,
} from '../types'

/**
 * Lists students, optionally filtered by text and activity.
 * @param filters - Search text and activity flag.
 * @returns Matching students.
 * @throws {AxiosError} When the request fails or the user is not ADMIN (403).
 */
export async function getStudents(filters: StudentsFilters): Promise<Student[]> {
  const { data } = await httpClient.get<Student[]>('/students', { params: filters })
  return data
}

/**
 * Fetches a student.
 * @param id - Student profile identifier.
 * @returns The student.
 * @throws {AxiosError} When the id is invalid (400) or the student does not exist (404).
 */
export async function getStudent(id: string): Promise<Student> {
  const { data } = await httpClient.get<Student>(`/students/${id}`)
  return data
}

/**
 * Registers a student (user account plus academic profile).
 * @param payload - Student data and initial password.
 * @returns The created student.
 * @throws {AxiosError} On a duplicate code or email (409) or invalid data (400).
 */
export async function createStudent(payload: CreateStudentRequest): Promise<Student> {
  const { data } = await httpClient.post<Student>('/students', payload)
  return data
}

/**
 * Updates a student's data.
 * @param id - Student profile identifier.
 * @param payload - Fields to change.
 * @returns The updated student.
 * @throws {AxiosError} On a duplicate code or email (409) or a missing student (404).
 */
export async function updateStudent(id: string, payload: UpdateStudentRequest): Promise<Student> {
  const { data } = await httpClient.patch<Student>(`/students/${id}`, payload)
  return data
}

/**
 * Activates or deactivates a student.
 * @param id - Student profile identifier.
 * @param isActive - New activity flag.
 * @returns The updated student.
 * @throws {AxiosError} When the student does not exist (404).
 */
export async function updateStudentStatus(id: string, isActive: boolean): Promise<Student> {
  const { data } = await httpClient.patch<Student>(`/students/${id}/status`, { isActive })
  return data
}
