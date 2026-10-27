import { Inject, Injectable } from "@nestjs/common";
import {
  ENROLLMENT_REPOSITORY,
  EnrollmentRepository,
} from "../domain/enrollment.repository";

/**
 * Use case for canceling an existing enrollment.
 */
@Injectable()
export class CancelEnrollmentUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(): Promise<void> {
    // Skeleton use case
  }
}
