import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RecordGradeUseCase } from "../application/record-grade.use-case";
import { GetAcademicHistoryUseCase } from "../application/get-academic-history.use-case";

/**
 * Controller handling grade-related HTTP endpoints.
 */
@ApiTags("Grades")
@Controller("grades")
export class GradesController {
  constructor(
    private readonly recordGradeUseCase: RecordGradeUseCase,
    private readonly getAcademicHistoryUseCase: GetAcademicHistoryUseCase,
  ) {}
}
