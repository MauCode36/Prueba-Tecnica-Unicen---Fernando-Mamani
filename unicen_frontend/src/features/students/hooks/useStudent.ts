import { useQuery } from '@tanstack/react-query'
import { isClientError } from '@/shared/lib/http-status.utils'
import { getStudent } from '../services/students.service'
import { studentsKeys } from './students.keys'

/**
 * Loads one student. 4xx answers are not retried so a missing student is
 * reported right away.
 * @param id - Student profile identifier.
 * @returns The student query.
 */
export function useStudent(id: string) {
  return useQuery({
    queryKey: studentsKeys.detail(id),
    queryFn: () => getStudent(id),
    retry: (count, error) => !isClientError(error) && count < 1,
  })
}
