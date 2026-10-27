import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ENROLLMENT_REPOSITORY } from "./domain/enrollment.repository";
import { EnrollStudentUseCase } from "./application/enroll-student.use-case";
import { CancelEnrollmentUseCase } from "./application/cancel-enrollment.use-case";
import { EnrollmentOrmEntity } from "./infrastructure/enrollment.orm-entity";
import { TypeOrmEnrollmentRepository } from "./infrastructure/typeorm-enrollment.repository";
import { EnrollmentsController } from "./presentation/enrollments.controller";

/**
 * Module encapsulating enrollment domain and operations.
 */
@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentOrmEntity])],
  controllers: [EnrollmentsController],
  providers: [
    EnrollStudentUseCase,
    CancelEnrollmentUseCase,
    {
      provide: ENROLLMENT_REPOSITORY,
      useClass: TypeOrmEnrollmentRepository,
    },
  ],
  exports: [ENROLLMENT_REPOSITORY],
})
export class EnrollmentsModule {}
