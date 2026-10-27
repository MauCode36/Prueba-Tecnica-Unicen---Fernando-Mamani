import { DataSource, EntityManager, Repository } from "typeorm";
import { AuthenticatedUser } from "../../shared/decorators/current-user.decorator";
import { Role } from "../../shared/enums/role.enum";
import {
  CapacityBelowEnrollmentError,
  DuplicateCourseError,
  ForbiddenActionError,
  InvalidCourseTeacherError,
  NotFoundError,
} from "../../shared/errors";
import { SubjectsService } from "../subjects/subjects.service";
import { UsersService } from "../users/users.service";
import { CourseView } from "./course-view.type";
import { CourseEntity } from "./course.entity";
import { CoursesQueryBuilder } from "./courses-query.builder";
import { CoursesService } from "./courses.service";

const view: CourseView = {
  id: "c1",
  term: "2026-2",
  section: "A",
  maxCapacity: 30,
  enrolledCount: 10,
  isEnrolled: false,
  subject: { id: "s1", code: "MAT-101", name: "Cálculo I", credits: 5 },
  teacher: { id: "t1", name: "Dr. Mendoza" },
};

function user(role: Role, id = "u1"): AuthenticatedUser {
  return { id, sub: id, email: "x@unicen.edu.bo", role };
}

describe("CoursesService", () => {
  let repository: { existsBy: jest.Mock; findOne: jest.Mock; create: jest.Mock; save: jest.Mock; delete: jest.Mock };
  let manager: { findOne: jest.Mock; existsBy: jest.Mock; save: jest.Mock };
  let dataSource: { transaction: jest.Mock };
  let queryBuilder: {
    findMany: jest.Mock;
    findOneView: jest.Mock;
    countActiveEnrollments: jest.Mock;
    findEnrolledStudents: jest.Mock;
  };
  let subjectsService: { findEntityById: jest.Mock };
  let usersService: { findById: jest.Mock };
  let service: CoursesService;

  beforeEach(() => {
    repository = {
      existsBy: jest.fn().mockResolvedValue(false),
      findOne: jest.fn().mockResolvedValue({ id: "c1", teacherId: "t1" }),
      create: jest.fn((data: Partial<CourseEntity>) => data),
      save: jest.fn((data: Partial<CourseEntity>) =>
        Promise.resolve({ id: "c1", ...data }),
      ),
      delete: jest.fn(),
    };
    manager = {
      findOne: jest.fn().mockResolvedValue({
        id: "c1",
        subjectId: "s1",
        teacherId: "t1",
        term: "2026-2",
        section: "A",
        maxCapacity: 30,
      }),
      existsBy: jest.fn().mockResolvedValue(false),
      save: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn((cb: (m: EntityManager) => Promise<unknown>) =>
        cb(manager as unknown as EntityManager),
      ),
    };
    queryBuilder = {
      findMany: jest.fn().mockResolvedValue([view]),
      findOneView: jest.fn().mockResolvedValue(view),
      countActiveEnrollments: jest.fn().mockResolvedValue(10),
      findEnrolledStudents: jest.fn().mockResolvedValue([]),
    };
    subjectsService = { findEntityById: jest.fn().mockResolvedValue({ id: "s1" }) };
    usersService = {
      findById: jest
        .fn()
        .mockResolvedValue({ id: "t1", role: Role.TEACHER, isActive: true }),
    };
    service = new CoursesService(
      repository as unknown as Repository<CourseEntity>,
      dataSource as unknown as DataSource,
      queryBuilder as unknown as CoursesQueryBuilder,
      subjectsService as unknown as SubjectsService,
      usersService as unknown as UsersService,
    );
  });

  const createDto = {
    subjectId: "s1",
    teacherId: "t1",
    term: "2026-2",
    section: "A",
    maxCapacity: 30,
  };

  it("creates a course when subject exists and teacher has TEACHER role", async () => {
    const result = await service.create(createDto);

    expect(repository.save).toHaveBeenCalled();
    expect(result.availableSeats).toBe(20);
  });

  it("throws NotFoundError when subject does not exist", async () => {
    subjectsService.findEntityById.mockResolvedValue(null);

    await expect(service.create(createDto)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws InvalidCourseTeacherError when assigned user is not a TEACHER", async () => {
    usersService.findById.mockResolvedValue({
      id: "t1",
      role: Role.STUDENT,
      isActive: true,
    });

    await expect(service.create(createDto)).rejects.toBeInstanceOf(
      InvalidCourseTeacherError,
    );
  });

  it("throws DuplicateCourseError when subject, term and section already exist", async () => {
    repository.existsBy.mockResolvedValue(true);

    await expect(service.create(createDto)).rejects.toBeInstanceOf(
      DuplicateCourseError,
    );
  });

  it("throws CapacityBelowEnrollmentError when maxCapacity is lower than active enrollments", async () => {
    await expect(
      service.update("c1", { maxCapacity: 5 }),
    ).rejects.toBeInstanceOf(CapacityBelowEnrollmentError);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it("allows reducing maxCapacity down to the current enrollment count", async () => {
    await service.update("c1", { maxCapacity: 10 });

    expect(manager.save).toHaveBeenCalled();
  });

  it("throws ForbiddenActionError when a teacher requests students of a course they do not teach", async () => {
    await expect(
      service.findEnrolledStudents("c1", user(Role.TEACHER, "other")),
    ).rejects.toBeInstanceOf(ForbiddenActionError);
  });

  it("returns enrolled students for the assigned teacher and for ADMIN", async () => {
    await expect(
      service.findEnrolledStudents("c1", user(Role.TEACHER, "t1")),
    ).resolves.toEqual([]);
    await expect(
      service.findEnrolledStudents("c1", user(Role.ADMIN, "a1")),
    ).resolves.toEqual([]);
  });

  it("passes viewer user id to the projection only for STUDENT role", async () => {
    await service.findAll({}, user(Role.STUDENT, "stu1"));
    await service.findAll({}, user(Role.ADMIN, "adm1"));

    expect(queryBuilder.findMany).toHaveBeenNthCalledWith(1, {}, "stu1");
    expect(queryBuilder.findMany).toHaveBeenNthCalledWith(2, {}, undefined);
  });
});
