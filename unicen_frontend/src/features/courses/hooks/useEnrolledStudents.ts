import { useQuery } from '@tanstack/react-query'
import { isClientError } from '@/shared/lib/http-status.utils'
import { getEnrolledStudents } from '../services/courses.service'
import { coursesKeys } from './courses.keys'

/**
 * Loads the students enrolled in a course. 4xx answers (403, 404) are not
 * retried so the page can show them right away.
 * @param id - Course identifier.
 * @returns The enrolled students query.
 */
export function useEnrolledStudents(id: string) {
  return useQuery({
    queryKey: coursesKeys.enrolledStudents(id),
    queryFn: () => getEnrolledStudents(id),
    retry: (count, error) => !isClientError(error) && count < 1,
  })
}
