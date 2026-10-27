import { useQuery } from '@tanstack/react-query'
import { getStudents } from '../services/students.service'
import type { StudentsFilters } from '../types'
import { studentsKeys } from './students.keys'

/**
 * Loads the students matching the filters.
 * @param filters - Search text and activity flag.
 * @returns The students query.
 */
export function useStudents(filters: StudentsFilters) {
  return useQuery({ queryKey: studentsKeys.list(filters), queryFn: () => getStudents(filters) })
}
