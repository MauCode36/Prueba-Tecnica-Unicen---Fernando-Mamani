import { Enrollment } from "./enrollment.entity";
import { EnrollmentFilters, EnrollmentSummary } from "./enrollment-summary";

export const ENROLLMENT_REPOSITORY = Symbol("ENROLLMENT_REPOSITORY");

/**
 * Operations available while a course row is locked inside a transaction.
 */
export interface LockedCourseContext {
  /** Capacity data of the locked course, or null if it does not exist. */
  course: { id: string; maxCapacity: number } | null;
  /** Counts the active enrollments of the locked course. */
  countActive(): Promise<number>;
  /** Finds the enrollment of a student in the locked course. */
  findByStudent(studentId: string): Promise<Enrollment | null>;
  /** Persists an enrollment inside the same transaction. */
  save(enrollment: Enrollment): Promise<Enrollment>;
}

/**
 * Domain repository interface (port) for enrollments.
 */
export interface EnrollmentRepository {
  /**
   * Runs `work` in one transaction with the course row locked (SELECT ... FOR UPDATE).
   * @param courseId - Course to lock.
   * @param work - Callback receiving the locked-course operations.
   * @returns The callback result.
   */
  withLockedCourse<T>(
    courseId: string,
    work: (tx: LockedCourseContext) => Promise<T>,
  ): Promise<T>;
  findById(id: string): Promise<Enrollment | null>;
  save(enrollment: Enrollment): Promise<Enrollment>;
  findSummaries(filters: EnrollmentFilters): Promise<EnrollmentSummary[]>;
}
