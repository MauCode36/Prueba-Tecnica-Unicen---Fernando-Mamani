import { QUERY_ROOTS } from '@/shared/api/query-roots'
import type { EnrollmentsFilters } from '../types'

/** Centralized TanStack Query keys for the enrollments feature. */
export const enrollmentsKeys = {
  all: [QUERY_ROOTS.enrollments] as const,
  mine: (term: string) => [...enrollmentsKeys.all, 'mine', term] as const,
  list: (filters: EnrollmentsFilters) => [...enrollmentsKeys.all, 'list', filters] as const,
  courseOptions: (term: string) => [...enrollmentsKeys.all, 'course-options', term] as const,
}
