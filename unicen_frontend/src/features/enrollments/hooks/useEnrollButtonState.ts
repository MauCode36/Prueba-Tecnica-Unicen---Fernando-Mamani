import type { EnrollableCourse } from '../types'

/** UX state of the enroll button. */
export interface EnrollButtonState {
  /** True when enrolling cannot work from what the row already shows. */
  isDisabled: boolean
  /** Spanish explanation shown in the tooltip; empty when enabled. */
  reason: string
}

/**
 * Derives whether the enroll button is disabled and why. This is UX only: the
 * backend still validates seats and duplicates and answers 409.
 * @param course - Course row from the offering.
 * @returns The disabled flag and its reason.
 */
export function useEnrollButtonState(course: EnrollableCourse): EnrollButtonState {
  if (course.isEnrolled) return { isDisabled: true, reason: 'Ya estás inscrito' }
  if (course.availableSeats <= 0) return { isDisabled: true, reason: 'Sin cupos disponibles' }
  return { isDisabled: false, reason: '' }
}
