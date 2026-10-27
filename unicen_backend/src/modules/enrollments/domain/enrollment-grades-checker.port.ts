export const ENROLLMENT_GRADES_CHECKER = Symbol("ENROLLMENT_GRADES_CHECKER");

/**
 * Port to know whether an enrollment already has grades (implemented by grades, E4).
 */
export interface EnrollmentGradesChecker {
  hasGrades(enrollmentId: string): Promise<boolean>;
}
