/** Lifecycle status of an enrollment. */
export const EnrollmentStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
} as const

export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus]

/** Result of enrolling or cancelling. */
export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  status: EnrollmentStatus
  enrolledAt: string
}

/** Enrollment with course and student data, for lists. */
export interface EnrollmentSummary {
  id: string
  status: EnrollmentStatus
  enrolledAt: string
  student: { id: string; studentCode: string; name: string }
  course: {
    id: string
    term: string
    section: string
    subject: { code: string; name: string; credits: number }
    teacher: { name: string }
  }
}

/** Payload for POST /enrollments; `studentId` is only for ADMIN. */
export interface CreateEnrollmentRequest {
  courseId: string
  studentId?: string
}

/** Mirrors ListEnrollmentsQueryDto. */
export interface EnrollmentsFilters {
  studentId?: string
  courseId?: string
  term?: string
  status?: EnrollmentStatus
}

/**
 * Minimal course data `EnrollButton` needs. It is structural, so the courses
 * `Course` type fits without this feature importing it.
 */
export interface EnrollableCourse {
  id: string
  availableSeats: number
  isEnrolled: boolean
}

/** Option of the admin course select; full courses stay visible but disabled. */
export interface EnrollCourseOption {
  value: string
  label: string
  isDisabled: boolean
}
