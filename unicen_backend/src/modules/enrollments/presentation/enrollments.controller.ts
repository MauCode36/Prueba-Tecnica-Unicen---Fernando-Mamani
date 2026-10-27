import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EnrollStudentUseCase } from "../application/enroll-student.use-case";
import { CancelEnrollmentUseCase } from "../application/cancel-enrollment.use-case";

/**
 * Controller handling enrollment HTTP endpoints.
 */
@ApiTags("Enrollments")
@Controller("enrollments")
export class EnrollmentsController {
  constructor(
    private readonly enrollStudentUseCase: EnrollStudentUseCase,
    private readonly cancelEnrollmentUseCase: CancelEnrollmentUseCase,
  ) {}
}
