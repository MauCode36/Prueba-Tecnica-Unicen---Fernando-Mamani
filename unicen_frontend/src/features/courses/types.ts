/** Subject summary embedded in a course. */
export interface CourseSubject {
  id: string
  code: string
  name: string
  credits: number
}

/** Teacher summary embedded in a course. */
export interface CourseTeacher {
  id: string
  name: string
}

/** Course offering with computed seats, as returned by the API. */
export interface Course {
  id: string
  term: string
  section: string
  maxCapacity: number
  enrolledCount: number
  availableSeats: number
  isEnrolled: boolean
  subject: CourseSubject
  teacher: CourseTeacher
}

/** Payload for POST /courses. */
export interface CreateCourseRequest {
  subjectId: string
  teacherId: string
  term: string
  section: string
  maxCapacity: number
}

/** Payload for PATCH /courses/:id. */
export type UpdateCourseRequest = Partial<CreateCourseRequest>

/** Mirrors ListCoursesQueryDto; E2 only exposes `term` in the UI. */
export interface CoursesFilters {
  term?: string
  subjectId?: string
}

/** Student enrolled in a course; `studentId` is the student profile id, not the user id. */
export interface EnrolledStudent {
  enrollmentId: string
  studentId: string
  studentCode: string
  name: string
  email: string
  program: string
  enrolledAt: string
}

/** Option for the subject and teacher selects. */
export interface SelectOption {
  value: string
  label: string
}

/** Subject and teacher options used by the course form. */
export interface CourseOptions {
  subjects: SelectOption[]
  teachers: SelectOption[]
}
