import { DataSource, EntityManager, Repository } from "typeorm";
import { Role } from "../../shared/enums/role.enum";
import {
  DuplicateStudentCodeError,
  DuplicateUserEmailError,
} from "../../shared/errors";
import { UsersService } from "../users/users.service";
import { StudentEntity } from "./student.entity";
import { StudentsService } from "./students.service";

describe("StudentsService", () => {
  let manager: { existsBy: jest.Mock; create: jest.Mock; save: jest.Mock };
  let repository: { findOne: jest.Mock };
  let dataSource: { transaction: jest.Mock };
  let usersService: { create: jest.Mock; update: jest.Mock };
  let service: StudentsService;

  const dto = {
    name: "Luis",
    email: "luis@unicen.edu.bo",
    password: "Student123!",
    studentCode: "S-1",
    program: "Sistemas",
  };

  beforeEach(() => {
    manager = {
      existsBy: jest.fn().mockResolvedValue(false),
      create: jest.fn((_e: unknown, data: Partial<StudentEntity>) => data),
      save: jest.fn((data: Partial<StudentEntity>) =>
        Promise.resolve({ id: "st1", ...data }),
      ),
    };
    repository = {
      findOne: jest.fn().mockResolvedValue({
        id: "st1",
        userId: "u1",
        studentCode: "S-1",
        program: "Sistemas",
        createdAt: new Date(),
        user: { name: "Luis", email: "luis@unicen.edu.bo", isActive: true },
      }),
    };
    dataSource = {
      transaction: jest.fn((cb: (m: EntityManager) => Promise<unknown>) =>
        cb(manager as unknown as EntityManager),
      ),
    };
    usersService = {
      create: jest.fn().mockResolvedValue({ id: "u1" }),
      update: jest.fn().mockResolvedValue({}),
    };
    service = new StudentsService(
      repository as unknown as Repository<StudentEntity>,
      dataSource as unknown as DataSource,
      usersService as unknown as UsersService,
    );
  });

  it("creates user and profile in one transaction", async () => {
    const result = await service.create(dto);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: Role.STUDENT }),
      manager,
    );
    expect(result).not.toHaveProperty("passwordHash");
    expect(result.studentCode).toBe("S-1");
  });

  it("throws DuplicateStudentCodeError when the code exists", async () => {
    manager.existsBy.mockResolvedValue(true);

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      DuplicateStudentCodeError,
    );
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it("throws DuplicateUserEmailError when the email exists", async () => {
    usersService.create.mockRejectedValue(new DuplicateUserEmailError());

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      DuplicateUserEmailError,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });

  it("deactivates the student user without touching enrollments", async () => {
    await service.updateStatus("st1", false);

    expect(usersService.update).toHaveBeenCalledWith("u1", {
      isActive: false,
    });
  });
});
