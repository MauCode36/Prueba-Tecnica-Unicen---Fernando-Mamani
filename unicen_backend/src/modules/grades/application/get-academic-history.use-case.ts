import { Inject, Injectable } from "@nestjs/common";
import { GRADE_REPOSITORY, GradeRepository } from "../domain/grade.repository";
import {
  GRADE_CALCULATION_STRATEGY,
  GradeCalculationStrategy,
} from "../domain/grade-calculation.strategy";

/**
 * Use case for retrieving a student's academic history.
 */
@Injectable()
export class GetAcademicHistoryUseCase {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private readonly gradeRepository: GradeRepository,
    @Inject(GRADE_CALCULATION_STRATEGY)
    private readonly gradeCalculationStrategy: GradeCalculationStrategy,
  ) {}

  async execute(): Promise<void> {
    // Skeleton use case
  }
}
