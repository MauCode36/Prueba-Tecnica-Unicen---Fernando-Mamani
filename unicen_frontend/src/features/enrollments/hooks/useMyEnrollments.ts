import { useQuery } from '@tanstack/react-query'
import { getMyEnrollments } from '../services/enrollments.service'
import { enrollmentsKeys } from './enrollments.keys'

/**
 * Loads the active enrollments of the authenticated student in a term.
 * @param term - Term to list, for example `2026-2`.
 * @returns The enrollments query.
 */
export function useMyEnrollments(term: string) {
  return useQuery({
    queryKey: enrollmentsKeys.mine(term),
    queryFn: () => getMyEnrollments(term),
  })
}
