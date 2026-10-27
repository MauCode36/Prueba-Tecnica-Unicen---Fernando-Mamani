import { useQuery } from '@tanstack/react-query'
import { isClientError } from '@/shared/lib/http-status.utils'
import { getCourse } from '../services/courses.service'
import { coursesKeys } from './courses.keys'

/**
 * Loads one course, for example to title the enrolled students page.
 * 4xx answers are not retried.
 * @param id - Course identifier.
 * @returns The course query.
 */
export function useCourse(id: string) {
  return useQuery({
    queryKey: coursesKeys.detail(id),
    queryFn: () => getCourse(id),
    retry: (count, error) => !isClientError(error) && count < 1,
  })
}
