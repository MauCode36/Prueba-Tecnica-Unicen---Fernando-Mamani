import { EnrollmentStatus } from "./enrollment-status.enum";

/**
 * Read model of an enrollment with its student and course details.
 */
export interface EnrollmentSummary {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  student: { id: string; studentCode: string; name: string };
  course: {
    id: string;
    term: string;
    section: string;
    subject: { code: string; name: string; credits: number };
    teacher: { name: string };
  };
}

/**
 * Filters accepted when listing enrollment summaries.
 */
export interface EnrollmentFilters {
  studentId?: string;
  courseId?: string;
  term?: string;
  status?: EnrollmentStatus;
}
