import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { Role } from "../../shared/enums/role.enum";
import { DuplicateUserEmailError } from "../../shared/errors";
import { UserEntity } from "./user.entity";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let repository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };
  let service: UsersService;

  beforeEach(() => {
    repository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data: Partial<UserEntity>) => data),
      save: jest.fn((data: Partial<UserEntity>) =>
        Promise.resolve({
          ...data,
          id: "u1",
          isActive: true,
          createdAt: new Date(),
        }),
      ),
      find: jest.fn(),
    };
    service = new UsersService(repository as unknown as Repository<UserEntity>);
  });

  it("creates a user with hashed password and returns UserResponseDto without passwordHash", async () => {
    const result = await service.create({
      name: "Docente",
      email: "  Docente@Unicen.edu.bo ",
      password: "Teacher123!",
      role: Role.TEACHER,
    });

    const persisted = repository.create.mock.calls[0][0] as UserEntity;
    expect(persisted.email).toBe("docente@unicen.edu.bo");
    expect(persisted.passwordHash).not.toBe("Teacher123!");
    expect(await bcrypt.compare("Teacher123!", persisted.passwordHash)).toBe(
      true,
    );
    expect(result).not.toHaveProperty("passwordHash");
    expect(result.id).toBe("u1");
  });

  it("throws DuplicateUserEmailError when email already exists", async () => {
    repository.findOne.mockResolvedValue({ id: "u0" });

    await expect(
      service.create({
        name: "X",
        email: "x@unicen.edu.bo",
        password: "secret1",
        role: Role.STUDENT,
      }),
    ).rejects.toBeInstanceOf(DuplicateUserEmailError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("filters users by role ordered by newest first", async () => {
    repository.find.mockResolvedValue([]);

    await service.findAll(Role.TEACHER);

    expect(repository.find).toHaveBeenCalledWith({
      where: { role: Role.TEACHER },
      order: { createdAt: "DESC" },
    });
  });
});
