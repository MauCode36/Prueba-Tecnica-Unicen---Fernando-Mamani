import type { CoursesFilters } from '../types'

/** Centralized TanStack Query keys for the courses feature. */
export const coursesKeys = {
  all: ['courses'] as const,
  list: (filters: CoursesFilters) => [...coursesKeys.all, 'list', filters] as const,
  mine: () => [...coursesKeys.all, 'mine'] as const,
  detail: (id: string) => [...coursesKeys.all, 'detail', id] as const,
  enrolledStudents: (id: string) => [...coursesKeys.all, id, 'enrolled-students'] as const,
}

/** Select options live outside coursesKeys.all so course mutations do not refetch them. */
export const courseOptionsKeys = {
  all: ['course-options'] as const,
}
