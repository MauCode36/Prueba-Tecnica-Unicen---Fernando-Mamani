import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Role } from "../../../shared/enums/role.enum";
import {
  EnrollmentHasGradesError,
  ForbiddenActionError,
  NotFoundError,
} from "../../../shared/errors";
import { Enrollment } from "../domain/enrollment.entity";
import {
  ENROLLMENT_GRADES_CHECKER,
  EnrollmentGradesChecker,
} from "../domain/enrollment-grades-checker.port";
import {
  ENROLLMENT_REPOSITORY,
  EnrollmentRepository,
} from "../domain/enrollment.repository";
import {
  ENROLLMENT_CANCELLED,
  EnrollmentCancelledEvent,
} from "../domain/events/enrollment-cancelled.event";
import {
  STUDENT_DIRECTORY,
  StudentDirectory,
} from "../domain/student-directory.port";
import { EnrollmentActor } from "./enrollment-actor";

/**
 * Input of {@link CancelEnrollmentUseCase}.
 */
export interface CancelEnrollmentInput {
  enrollmentId: string;
  actor: EnrollmentActor;
}

/**
 * Use case for canceling an existing enrollment (soft cancel, no deletion).
 */
@Injectable()
export class CancelEnrollmentUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
    @Inject(STUDENT_DIRECTORY)
    private readonly studentDirectory: StudentDirectory,
    @Inject(ENROLLMENT_GRADES_CHECKER)
    private readonly gradesChecker: EnrollmentGradesChecker,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Cancels an enrollment, releasing its seat immediately.
   * @param input - Enrollment id and acting user.
   * @returns The cancelled enrollment.
   * @throws {NotFoundError} When the enrollment does not exist.
   * @throws {ForbiddenActionError} When a STUDENT cancels another student's enrollment.
   * @throws {EnrollmentHasGradesError} When the enrollment already has grades.
   * @throws {EnrollmentAlreadyCancelledError} When it is already cancelled.
   */
  async execute(input: CancelEnrollmentInput): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findById(
      input.enrollmentId,
    );
    if (!enrollment) {
      throw new NotFoundError("Inscripción no encontrada");
    }
    await this.assertCanCancel(enrollment, input.actor);
    if (await this.gradesChecker.hasGrades(enrollment.id)) {
      throw new EnrollmentHasGradesError();
    }
    enrollment.cancel();
    const saved = await this.enrollmentRepository.save(enrollment);
    this.eventEmitter.emit(
      ENROLLMENT_CANCELLED,
      new EnrollmentCancelledEvent(saved.id, saved.studentId, saved.courseId),
    );
    return saved;
  }

  private async assertCanCancel(
    enrollment: Enrollment,
    actor: EnrollmentActor,
  ): Promise<void> {
    if (actor.role !== Role.STUDENT) return;
    const own = await this.studentDirectory.findByUserId(actor.userId);
    if (!own || own.id !== enrollment.studentId) {
      throw new ForbiddenActionError(
        "Solo puedes cancelar tus propias inscripciones",
      );
    }
  }
}
