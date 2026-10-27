import { Inject, Injectable } from "@nestjs/common";
import { GRADE_REPOSITORY, GradeRepository } from "../domain/grade.repository";

/**
 * Use case for recording a grade for an enrolled student.
 */
@Injectable()
export class RecordGradeUseCase {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private readonly gradeRepository: GradeRepository,
  ) {}

  async execute(): Promise<void> {
    // Skeleton use case
  }
}
