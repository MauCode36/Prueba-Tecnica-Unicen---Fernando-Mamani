import { Inject, Injectable } from "@nestjs/common";
import { EnrollmentFilters, EnrollmentSummary } from "../domain/enrollment-summary";
import {
  ENROLLMENT_REPOSITORY,
  EnrollmentRepository,
} from "../domain/enrollment.repository";

/**
 * Use case listing enrollments with filters (ADMIN).
 */
@Injectable()
export class ListEnrollmentsUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  /**
   * Lists enrollments matching the filters.
   * @param filters - Optional student, course, term and status filters.
   * @returns The matching enrollment summaries.
   */
  execute(filters: EnrollmentFilters): Promise<EnrollmentSummary[]> {
    return this.enrollmentRepository.findSummaries(filters);
  }
}
