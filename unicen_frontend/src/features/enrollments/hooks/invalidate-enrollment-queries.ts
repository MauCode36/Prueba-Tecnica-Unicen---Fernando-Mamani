import type { QueryClient } from '@tanstack/react-query'
import { QUERY_ROOTS } from '@/shared/api/query-roots'

/**
 * Refreshes everything an enrollment change touches: the enrollment lists and
 * the course offering, whose seats and `isEnrolled` flag move with it.
 * @param queryClient - The app query client.
 */
export function invalidateEnrollmentQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.enrollments] })
  void queryClient.invalidateQueries({ queryKey: [QUERY_ROOTS.courses] })
}
