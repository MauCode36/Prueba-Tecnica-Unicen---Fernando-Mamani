import { useQuery } from '@tanstack/react-query'
import { getMyCourses } from '../services/courses.service'
import { coursesKeys } from './courses.keys'

/**
 * Loads the courses assigned to the authenticated teacher.
 * @returns The teacher's courses query.
 */
export function useMyCourses() {
  return useQuery({ queryKey: coursesKeys.mine(), queryFn: getMyCourses })
}
