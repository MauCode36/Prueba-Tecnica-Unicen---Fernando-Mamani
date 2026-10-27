/**
 * Internal read projection of a course with its seat counts (not an entity).
 */
export interface CourseView {
  id: string;
  term: string;
  section: string;
  maxCapacity: number;
  enrolledCount: number;
  isEnrolled: boolean;
  subject: { id: string; code: string; name: string; credits: number };
  teacher: { id: string; name: string };
}

/**
 * Internal read projection of a student enrolled in a course.
 */
export interface EnrolledStudentView {
  enrollmentId: string;
  studentId: string;
  studentCode: string;
  name: string;
  email: string;
  program: string;
  enrolledAt: Date;
}

/**
 * Filters accepted by the course list projection.
 */
export interface CourseFilters {
  term?: string;
  subjectId?: string;
  teacherId?: string;
}
