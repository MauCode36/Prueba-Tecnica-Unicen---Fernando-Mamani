import { Inject, Injectable } from "@nestjs/common";
import {
  ENROLLMENT_REPOSITORY,
  EnrollmentRepository,
} from "../domain/enrollment.repository";

/**
 * Use case for enrolling a student in a course.
 */
@Injectable()
export class EnrollStudentUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(): Promise<void> {
    // Skeleton use case
  }
}
