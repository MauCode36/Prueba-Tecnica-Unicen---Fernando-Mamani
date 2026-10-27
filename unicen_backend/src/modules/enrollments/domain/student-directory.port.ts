export const STUDENT_DIRECTORY = Symbol("STUDENT_DIRECTORY");

/**
 * Minimal view of a student profile needed to enroll.
 */
export interface StudentRef {
  id: string;
  isActive: boolean;
}

/**
 * Port to look up student profiles owned by another module.
 */
export interface StudentDirectory {
  findByUserId(userId: string): Promise<StudentRef | null>;
  findById(id: string): Promise<StudentRef | null>;
}
