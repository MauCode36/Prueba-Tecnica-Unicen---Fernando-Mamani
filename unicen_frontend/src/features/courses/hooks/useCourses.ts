import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../services/courses.service'
import { coursesKeys } from './courses.keys'

/**
 * Loads the course offering of a term.
 * @param term - Term to list, for example `2026-2`.
 * @returns The courses query.
 */
export function useCourses(term: string) {
  const filters = { term }
  return useQuery({ queryKey: coursesKeys.list(filters), queryFn: () => getCourses(filters) })
}
