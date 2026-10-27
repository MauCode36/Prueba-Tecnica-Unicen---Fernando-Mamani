import {
  CourseFullError,
  DuplicateEnrollmentError,
} from "../../../shared/errors";
import { Enrollment } from "./enrollment.entity";

/**
 * Input of the enrollment policy.
 */
export interface EnrollmentPolicyInput {
  /** Number of active enrollments in the course. */
  activeCount: number;
  /** Maximum capacity of the course. */
  maxCapacity: number;
  /** Previous enrollment of the same student in the course, if any. */
  existing: Enrollment | null;
}

/**
 * Business rules deciding whether a student can take a seat in a course.
 */
export class EnrollmentPolicy {
  /**
   * Asserts the enrollment is allowed. Duplicates are checked before capacity
   * so an already enrolled student never receives a "course full" error.
   * @param input - Seat count, capacity and previous enrollment.
   * @throws {DuplicateEnrollmentError} When an active enrollment already exists.
   * @throws {CourseFullError} When active enrollments reached the capacity.
   */
  static assertCanEnroll(input: EnrollmentPolicyInput): void {
    if (input.existing?.isActive) {
      throw new DuplicateEnrollmentError();
    }
    if (input.activeCount >= input.maxCapacity) {
      throw new CourseFullError();
    }
  }
}
