import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GRADE_REPOSITORY } from "./domain/grade.repository";
import {
  GRADE_CALCULATION_STRATEGY,
  SimpleAverageStrategy,
} from "./domain/grade-calculation.strategy";
import { RecordGradeUseCase } from "./application/record-grade.use-case";
import { GetAcademicHistoryUseCase } from "./application/get-academic-history.use-case";
import { GradeOrmEntity } from "./infrastructure/grade.orm-entity";
import { TypeOrmGradeRepository } from "./infrastructure/typeorm-grade.repository";
import { GradesController } from "./presentation/grades.controller";

/**
 * Module encapsulating grade operations and calculation strategies.
 */
@Module({
  imports: [TypeOrmModule.forFeature([GradeOrmEntity])],
  controllers: [GradesController],
  providers: [
    RecordGradeUseCase,
    GetAcademicHistoryUseCase,
    {
      provide: GRADE_REPOSITORY,
      useClass: TypeOrmGradeRepository,
    },
    {
      provide: GRADE_CALCULATION_STRATEGY,
      useClass: SimpleAverageStrategy,
    },
  ],
  exports: [GRADE_REPOSITORY],
})
export class GradesModule {}
