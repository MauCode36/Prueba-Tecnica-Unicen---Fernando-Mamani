import { Enrollment } from "./enrollment.entity";

export const ENROLLMENT_REPOSITORY = Symbol("ENROLLMENT_REPOSITORY");

/**
 * Domain repository interface (port) for enrollments.
 */
export interface EnrollmentRepository {
  save(enrollment: Enrollment): Promise<Enrollment>;
  findById(id: string): Promise<Enrollment | null>;
  delete(id: string): Promise<void>;
}
