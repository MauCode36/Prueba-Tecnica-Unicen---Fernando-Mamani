import { useQuery } from '@tanstack/react-query'
import { getEnrollments } from '../services/enrollments.service'
import { enrollmentsKeys } from './enrollments.keys'

/**
 * Loads a student's enrollments in a term, active and cancelled (ADMIN).
 * @param studentId - Student profile identifier.
 * @param term - Term to list.
 * @returns The enrollments query.
 */
export function useStudentEnrollments(studentId: string, term: string) {
  const filters = { studentId, term }
  return useQuery({
    queryKey: enrollmentsKeys.list(filters),
    queryFn: () => getEnrollments(filters),
  })
}
