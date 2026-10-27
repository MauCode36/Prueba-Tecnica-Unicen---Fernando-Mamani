import { useQuery } from '@tanstack/react-query'
import { getSubjects } from '../services/subjects.service'
import { subjectsKeys } from './subjects.keys'

/**
 * Loads the subject catalog.
 * @returns The subjects query.
 */
export function useSubjects() {
  return useQuery({ queryKey: subjectsKeys.list(), queryFn: getSubjects })
}
