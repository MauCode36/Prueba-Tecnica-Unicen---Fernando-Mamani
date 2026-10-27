import { Inject, Injectable } from "@nestjs/common";
import { EnrollmentStatus } from "../domain/enrollment-status.enum";
import { EnrollmentSummary } from "../domain/enrollment-summary";
import {
  ENROLLMENT_REPOSITORY,
  EnrollmentRepository,
} from "../domain/enrollment.repository";
import {
  STUDENT_DIRECTORY,
  StudentDirectory,
} from "../domain/student-directory.port";

/**
 * Use case listing the active enrollments of the authenticated student.
 */
@Injectable()
export class ListMyEnrollmentsUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
    @Inject(STUDENT_DIRECTORY)
    private readonly studentDirectory: StudentDirectory,
  ) {}

  /**
   * Lists the user's active enrollments, optionally for one term.
   * @param input - Authenticated user id and optional term (`YYYY-1`/`YYYY-2`).
   * @returns The enrollments, or an empty list when the user has no student profile.
   */
  async execute(input: {
    userId: string;
    term?: string;
  }): Promise<EnrollmentSummary[]> {
    const student = await this.studentDirectory.findByUserId(input.userId);
    if (!student) return [];
    return this.enrollmentRepository.findSummaries({
      studentId: student.id,
      term: input.term,
      status: EnrollmentStatus.ACTIVE,
    });
  }
}
