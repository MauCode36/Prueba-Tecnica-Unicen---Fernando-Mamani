import { EventEmitter2 } from "@nestjs/event-emitter";
import { Role } from "../../../shared/enums/role.enum";
import {
  CourseFullError,
  DuplicateEnrollmentError,
  ForbiddenActionError,
  InactiveStudentError,
  NotFoundError,
  StudentProfileNotFoundError,
  StudentRequiredError,
} from "../../../shared/errors";
import { Enrollment } from "../domain/enrollment.entity";
import {
  EnrollmentRepository,
  LockedCourseContext,
} from "../domain/enrollment.repository";
import { ENROLLMENT_CREATED } from "../domain/events/enrollment-created.event";
import { EnrollStudentUseCase } from "./enroll-student.use-case";

describe("EnrollStudentUseCase", () => {
  let tx: {
    course: { id: string; maxCapacity: number } | null;
    countActive: jest.Mock;
    findByStudent: jest.Mock;
    save: jest.Mock;
  };
  let repository: EnrollmentRepository;
  let directory: { findByUserId: jest.Mock; findById: jest.Mock };
  let emitter: { emit: jest.Mock };
  let useCase: EnrollStudentUseCase;

  const studentActor = { userId: "u1", role: Role.STUDENT };
  const adminActor = { userId: "a1", role: Role.ADMIN };

  beforeEach(() => {
    tx = {
      course: { id: "c1", maxCapacity: 2 },
      countActive: jest.fn().mockResolvedValue(1),
      findByStudent: jest.fn().mockResolvedValue(null),
      save: jest.fn((e: Enrollment) => Promise.resolve(e)),
    };
    repository = {
      withLockedCourse: jest.fn(
        (_id: string, work: (t: LockedCourseContext) => Promise<unknown>) =>
          work(tx as unknown as LockedCourseContext),
      ),
    } as unknown as EnrollmentRepository;
    directory = {
      findByUserId: jest.fn().mockResolvedValue({ id: "s1", isActive: true }),
      findById: jest.fn().mockResolvedValue({ id: "s2", isActive: true }),
    };
    emitter = { emit: jest.fn() };
    useCase = new EnrollStudentUseCase(
      repository,
      directory,
      emitter as unknown as EventEmitter2,
    );
  });

  it("enrolls the authenticated student when seats are available", async () => {
    const result = await useCase.execute({
      courseId: "c1",
      actor: studentActor,
    });

    expect(result.studentId).toBe("s1");
    expect(result.courseId).toBe("c1");
    expect(result.isActive).toBe(true);
    expect(tx.save).toHaveBeenCalledTimes(1);
  });

  it("throws CourseFullError when the course has no seats left", async () => {
    tx.countActive.mockResolvedValue(2);

    await expect(
      useCase.execute({ courseId: "c1", actor: studentActor }),
    ).rejects.toBeInstanceOf(CourseFullError);
  });

  it("throws DuplicateEnrollmentError when the student is already enrolled", async () => {
    tx.findByStudent.mockResolvedValue(Enrollment.create("s1", "c1"));

    await expect(
      useCase.execute({ courseId: "c1", actor: studentActor }),
    ).rejects.toBeInstanceOf(DuplicateEnrollmentError);
  });

  it("throws NotFoundError when the course does not exist", async () => {
    tx.course = null;

    await expect(
      useCase.execute({ courseId: "nope", actor: studentActor }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws StudentProfileNotFoundError when the STUDENT user has no profile", async () => {
    directory.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute({ courseId: "c1", actor: studentActor }),
    ).rejects.toBeInstanceOf(StudentProfileNotFoundError);
  });

  it("throws ForbiddenActionError when a STUDENT enrolls another student", async () => {
    await expect(
      useCase.execute({ courseId: "c1", actor: studentActor, studentId: "s9" }),
    ).rejects.toBeInstanceOf(ForbiddenActionError);
  });

  it("throws StudentRequiredError when ADMIN omits studentId", async () => {
    await expect(
      useCase.execute({ courseId: "c1", actor: adminActor }),
    ).rejects.toBeInstanceOf(StudentRequiredError);
  });

  it("enrolls the given student when ADMIN passes studentId", async () => {
    const result = await useCase.execute({
      courseId: "c1",
      actor: adminActor,
      studentId: "s2",
    });

    expect(result.studentId).toBe("s2");
  });

  it("throws NotFoundError when ADMIN passes an unknown studentId", async () => {
    directory.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ courseId: "c1", actor: adminActor, studentId: "x" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws InactiveStudentError when the student is inactive", async () => {
    directory.findByUserId.mockResolvedValue({ id: "s1", isActive: false });

    await expect(
      useCase.execute({ courseId: "c1", actor: studentActor }),
    ).rejects.toBeInstanceOf(InactiveStudentError);
    expect(repository.withLockedCourse).not.toHaveBeenCalled();
  });

  it("reactivates a cancelled enrollment instead of inserting a new one", async () => {
    const cancelled = Enrollment.create("s1", "c1");
    cancelled.cancel();
    tx.findByStudent.mockResolvedValue(cancelled);

    const result = await useCase.execute({
      courseId: "c1",
      actor: studentActor,
    });

    expect(result.id).toBe(cancelled.id);
    expect(result.isActive).toBe(true);
  });

  it("emits enrollment.created after saving", async () => {
    const result = await useCase.execute({
      courseId: "c1",
      actor: studentActor,
    });

    expect(emitter.emit).toHaveBeenCalledWith(
      ENROLLMENT_CREATED,
      expect.objectContaining({ enrollmentId: result.id, courseId: "c1" }),
    );
  });

  it("does not emit the event when validation fails", async () => {
    tx.countActive.mockResolvedValue(2);

    await expect(
      useCase.execute({ courseId: "c1", actor: studentActor }),
    ).rejects.toBeInstanceOf(CourseFullError);
    expect(emitter.emit).not.toHaveBeenCalled();
  });
});
