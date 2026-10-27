import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoursesModule } from "../courses/courses.module";
import { StudentsModule } from "../students/students.module";
import { CancelEnrollmentUseCase } from "./application/cancel-enrollment.use-case";
import { EnrollStudentUseCase } from "./application/enroll-student.use-case";
import { ListEnrollmentsUseCase } from "./application/list-enrollments.use-case";
import { ListMyEnrollmentsUseCase } from "./application/list-my-enrollments.use-case";
import { ENROLLMENT_GRADES_CHECKER } from "./domain/enrollment-grades-checker.port";
import { ENROLLMENT_REPOSITORY } from "./domain/enrollment.repository";
import { STUDENT_DIRECTORY } from "./domain/student-directory.port";
import { EnrollmentAuditListener } from "./infrastructure/enrollment-audit.listener";
import { EnrollmentOrmEntity } from "./infrastructure/enrollment.orm-entity";
import { PendingGradesChecker } from "./infrastructure/pending-grades.checker";
import { StudentDirectoryAdapter } from "./infrastructure/student-directory.adapter";
import { TypeOrmEnrollmentRepository } from "./infrastructure/typeorm-enrollment.repository";
import { EnrollmentsController } from "./presentation/enrollments.controller";

/**
 * Module encapsulating enrollment domain and operations.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentOrmEntity]),
    StudentsModule,
    CoursesModule,
  ],
  controllers: [EnrollmentsController],
  providers: [
    EnrollStudentUseCase,
    CancelEnrollmentUseCase,
    ListMyEnrollmentsUseCase,
    ListEnrollmentsUseCase,
    EnrollmentAuditListener,
    { provide: ENROLLMENT_REPOSITORY, useClass: TypeOrmEnrollmentRepository },
    { provide: STUDENT_DIRECTORY, useClass: StudentDirectoryAdapter },
    { provide: ENROLLMENT_GRADES_CHECKER, useClass: PendingGradesChecker },
  ],
  exports: [ENROLLMENT_REPOSITORY],
})
export class EnrollmentsModule {}
