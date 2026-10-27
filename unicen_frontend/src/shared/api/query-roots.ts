/**
 * Root query keys per feature, so one feature can invalidate another
 * (for example an enrollment refreshes the course seats) without
 * importing its internals.
 */
export const QUERY_ROOTS = {
  courses: 'courses',
  enrollments: 'enrollments',
  students: 'students',
} as const
