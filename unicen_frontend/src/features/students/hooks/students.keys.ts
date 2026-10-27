import { QUERY_ROOTS } from '@/shared/api/query-roots'
import type { StudentsFilters } from '../types'

/** Centralized TanStack Query keys for the students feature. */
export const studentsKeys = {
  all: [QUERY_ROOTS.students] as const,
  list: (filters: StudentsFilters) => [...studentsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...studentsKeys.all, 'detail', id] as const,
}
