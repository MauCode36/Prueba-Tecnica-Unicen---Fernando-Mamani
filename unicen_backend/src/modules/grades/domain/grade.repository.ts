import { Grade } from "./grade.entity";

export const GRADE_REPOSITORY = Symbol("GRADE_REPOSITORY");

/**
 * Domain repository interface (port) for grades.
 */
export interface GradeRepository {
  save(grade: Grade): Promise<Grade>;
  findByEnrollmentId(enrollmentId: string): Promise<Grade[]>;
}
