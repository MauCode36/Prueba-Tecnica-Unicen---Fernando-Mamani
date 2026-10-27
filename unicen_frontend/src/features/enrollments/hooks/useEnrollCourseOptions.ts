import { useQuery } from '@tanstack/react-query'
import { getEnrollCourseOptions } from '../services/enroll-course-options.service'
import { enrollmentsKeys } from './enrollments.keys'

/**
 * Loads the term offering for the admin enroll dialog. It runs only while the
 * dialog is open and refetches on every open, because other enrollments move
 * the seats between uses.
 * @param term - Term to list.
 * @param isOpen - Whether the dialog is open.
 * @returns The options query.
 */
export function useEnrollCourseOptions(term: string, isOpen: boolean) {
  return useQuery({
    queryKey: enrollmentsKeys.courseOptions(term),
    queryFn: () => getEnrollCourseOptions(term),
    enabled: isOpen,
    refetchOnMount: 'always',
    staleTime: 0,
  })
}
