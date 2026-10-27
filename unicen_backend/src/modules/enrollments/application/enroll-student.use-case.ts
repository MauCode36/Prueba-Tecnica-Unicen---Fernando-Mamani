import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Role } from "../../../shared/enums/role.enum";
import {
  ForbiddenActionError,
  InactiveStudentError,
  NotFoundError,
  StudentProfileNotFoundError,
  StudentRequiredError,
} from "../../../shared/errors";
import { Enrollment } from "../domain/enrollment.entity";
import { EnrollmentPolicy } from "../domain/enrollment.policy";
import {
  ENROLLMENT_REPOSITORY,
  EnrollmentRepository,
} from "../domain/enrollment.repository";
import {
  ENROLLMENT_CREATED,
  EnrollmentCreatedEvent,
} from "../domain/events/enrollment-created.event";
import {
  STUDENT_DIRECTORY,
  StudentDirectory,
  StudentRef,
} from "../domain/student-directory.port";
import { EnrollmentActor } from "./enrollment-actor";

/**
 * Input of {@link EnrollStudentUseCase}.
 */
export interface EnrollStudentInput {
  courseId: string;
  actor: EnrollmentActor;
  /** Required for ADMIN; a STUDENT may only pass their own profile id. */
  studentId?: string;
}

/**
 * Use case for enrolling a student in a course (self-service or by an admin).
 */
@Injectable()
export class EnrollStudentUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
    @Inject(STUDENT_DIRECTORY)
    private readonly studentDirectory: StudentDirectory,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Enrolls a student, validating capacity and duplicates under a course lock.
   * @param input - Course, acting user and optional student id.
   * @returns The created (or re-activated) enrollment.
   * @throws {StudentProfileNotFoundError} When a STUDENT user has no profile.
   * @throws {ForbiddenActionError} When a STUDENT enrolls another student.
   * @throws {StudentRequiredError} When an ADMIN omits the student id.
   * @throws {NotFoundError} When the student or the course does not exist.
   * @throws {InactiveStudentError} When the student is inactive.
   * @throws {DuplicateEnrollmentError} When the student is already enrolled.
   * @throws {CourseFullError} When the course has no seats left.
   */
  async execute(input: EnrollStudentInput): Promise<Enrollment> {
    const student = await this.resolveStudent(input);
    if (!student.isActive) {
      throw new InactiveStudentError();
    }
    const enrollment = await this.enrollmentRepository.withLockedCourse(
      input.courseId,
      async (tx) => {
        if (!tx.course) {
          throw new NotFoundError("Curso no encontrado");
        }
        const existing = await tx.findByStudent(student.id);
        const activeCount = await tx.countActive();
        EnrollmentPolicy.assertCanEnroll({
          activeCount,
          maxCapacity: tx.course.maxCapacity,
          existing,
        });
        if (existing) {
          existing.reactivate();
          return tx.save(existing);
        }
        return tx.save(Enrollment.create(student.id, input.courseId));
      },
    );
    this.eventEmitter.emit(
      ENROLLMENT_CREATED,
      new EnrollmentCreatedEvent(
        enrollment.id,
        enrollment.studentId,
        enrollment.courseId,
      ),
    );
    return enrollment;
  }

  private async resolveStudent(input: EnrollStudentInput): Promise<StudentRef> {
    if (input.actor.role === Role.ADMIN) {
      if (!input.studentId) throw new StudentRequiredError();
      const found = await this.studentDirectory.findById(input.studentId);
      if (!found) throw new NotFoundError("Estudiante no encontrado");
      return found;
    }
    const own = await this.studentDirectory.findByUserId(input.actor.userId);
    if (!own) throw new StudentProfileNotFoundError();
    if (input.studentId && input.studentId !== own.id) {
      throw new ForbiddenActionError(
        "Solo puedes inscribirte a ti mismo en un curso",
      );
    }
    return own;
  }
}
