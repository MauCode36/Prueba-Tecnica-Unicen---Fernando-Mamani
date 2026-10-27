import { httpClient } from '@/shared/api/httpClient'
import type { CreateSubjectRequest, Subject, UpdateSubjectRequest } from '../types'

/**
 * Lists the subject catalog.
 * @returns Subjects ordered by code.
 * @throws {AxiosError} When the request fails.
 */
export async function getSubjects(): Promise<Subject[]> {
  const { data } = await httpClient.get<Subject[]>('/subjects')
  return data
}

/**
 * Creates a subject.
 * @param payload - Subject data.
 * @returns The created subject.
 * @throws {AxiosError} When the code already exists (409) or the data is invalid (400).
 */
export async function createSubject(payload: CreateSubjectRequest): Promise<Subject> {
  const { data } = await httpClient.post<Subject>('/subjects', payload)
  return data
}

/**
 * Updates a subject.
 * @param id - Subject identifier.
 * @param payload - Fields to change.
 * @returns The updated subject.
 * @throws {AxiosError} When the subject is missing (404) or the code is taken (409).
 */
export async function updateSubject(id: string, payload: UpdateSubjectRequest): Promise<Subject> {
  const { data } = await httpClient.patch<Subject>(`/subjects/${id}`, payload)
  return data
}

/**
 * Deletes a subject.
 * @param id - Subject identifier.
 * @throws {AxiosError} When the subject has courses (409) or does not exist (404).
 */
export async function deleteSubject(id: string): Promise<void> {
  await httpClient.delete(`/subjects/${id}`)
}
