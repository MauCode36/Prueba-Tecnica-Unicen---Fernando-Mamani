import { EventEmitter2 } from "@nestjs/event-emitter";
import { Role } from "../../../shared/enums/role.enum";
import {
  EnrollmentAlreadyCancelledError,
  EnrollmentHasGradesError,
  ForbiddenActionError,
  NotFoundError,
} from "../../../shared/errors";
import { Enrollment } from "../domain/enrollment.entity";
import { EnrollmentRepository } from "../domain/enrollment.repository";
import { ENROLLMENT_CANCELLED } from "../domain/events/enrollment-cancelled.event";
import { StudentDirectory } from "../domain/student-directory.port";
import { CancelEnrollmentUseCase } from "./cancel-enrollment.use-case";

describe("CancelEnrollmentUseCase", () => {
  let enrollment: Enrollment;
  let repository: { findById: jest.Mock; save: jest.Mock };
  let directory: { findByUserId: jest.Mock };
  let grades: { hasGrades: jest.Mock };
  let emitter: { emit: jest.Mock };
  let useCase: CancelEnrollmentUseCase;

  beforeEach(() => {
    enrollment = Enrollment.create("s1", "c1");
    repository = {
      findById: jest.fn().mockResolvedValue(enrollment),
      save: jest.fn((e: Enrollment) => Promise.resolve(e)),
    };
    directory = {
      findByUserId: jest.fn().mockResolvedValue({ id: "s1", isActive: true }),
    };
    grades = { hasGrades: jest.fn().mockResolvedValue(false) };
    emitter = { emit: jest.fn() };
    useCase = new CancelEnrollmentUseCase(
      repository as unknown as EnrollmentRepository,
      directory as unknown as StudentDirectory,
      grades,
      emitter as unknown as EventEmitter2,
    );
  });

  it("cancels the student's own enrollment and emits enrollment.cancelled", async () => {
    const result = await useCase.execute({
      enrollmentId: enrollment.id,
      actor: { userId: "u1", role: Role.STUDENT },
    });

    expect(result.isActive).toBe(false);
    expect(repository.save).toHaveBeenCalled();
    expect(emitter.emit).toHaveBeenCalledWith(
      ENROLLMENT_CANCELLED,
      expect.objectContaining({ enrollmentId: enrollment.id }),
    );
  });

  it("allows ADMIN to cancel any enrollment", async () => {
    const result = await useCase.execute({
      enrollmentId: enrollment.id,
      actor: { userId: "a1", role: Role.ADMIN },
    });

    expect(result.isActive).toBe(false);
    expect(directory.findByUserId).not.toHaveBeenCalled();
  });

  it("throws ForbiddenActionError when a STUDENT cancels another student's enrollment", async () => {
    directory.findByUserId.mockResolvedValue({ id: "other", isActive: true });

    await expect(
      useCase.execute({
        enrollmentId: enrollment.id,
        actor: { userId: "u2", role: Role.STUDENT },
      }),
    ).rejects.toBeInstanceOf(ForbiddenActionError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("throws EnrollmentHasGradesError when grades exist", async () => {
    grades.hasGrades.mockResolvedValue(true);

    await expect(
      useCase.execute({
        enrollmentId: enrollment.id,
        actor: { userId: "a1", role: Role.ADMIN },
      }),
    ).rejects.toBeInstanceOf(EnrollmentHasGradesError);
  });

  it("throws EnrollmentAlreadyCancelledError when already cancelled", async () => {
    enrollment.cancel();

    await expect(
      useCase.execute({
        enrollmentId: enrollment.id,
        actor: { userId: "a1", role: Role.ADMIN },
      }),
    ).rejects.toBeInstanceOf(EnrollmentAlreadyCancelledError);
  });

  it("throws NotFoundError when the enrollment does not exist", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        enrollmentId: "nope",
        actor: { userId: "a1", role: Role.ADMIN },
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
