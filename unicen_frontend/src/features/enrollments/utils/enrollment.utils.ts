import type { EnrollmentSummary } from '../types'

/**
 * Adds up the credits of a list of enrollments (presentation only).
 * @param enrollments - Enrollments to add up.
 * @returns The total credits.
 */
export function sumCredits(enrollments: EnrollmentSummary[]): number {
  return enrollments.reduce((total, item) => total + item.course.subject.credits, 0)
}

/**
 * Short label of the course of an enrollment.
 * @param course - Course data of an enrollment summary.
 * @returns For example `MAT-101 A`.
 */
export function formatCourseLabel(course: EnrollmentSummary['course']): string {
  return `${course.subject.code} ${course.section}`
}
