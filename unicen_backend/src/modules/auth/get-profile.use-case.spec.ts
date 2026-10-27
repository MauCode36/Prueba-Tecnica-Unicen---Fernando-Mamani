import { Role } from "../../shared/enums/role.enum";
import { InvalidCredentialsError } from "../../shared/errors";
import { UsersService } from "../users/users.service";
import { GetProfileUseCase } from "./get-profile.use-case";

describe("GetProfileUseCase", () => {
  let usersService: { findById: jest.Mock };
  let useCase: GetProfileUseCase;

  beforeEach(() => {
    usersService = { findById: jest.fn() };
    useCase = new GetProfileUseCase(usersService as unknown as UsersService);
  });

  it("returns authenticated user profile when user exists and is active", async () => {
    usersService.findById.mockResolvedValue({
      id: "u1",
      name: "Ana",
      email: "a@unicen.edu.bo",
      role: Role.STUDENT,
      isActive: true,
      passwordHash: "secret",
    });

    const result = await useCase.execute("u1");

    expect(result).toEqual({
      id: "u1",
      name: "Ana",
      email: "a@unicen.edu.bo",
      role: Role.STUDENT,
    });
  });

  it("throws InvalidCredentialsError when user does not exist", async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(useCase.execute("u1")).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it("throws InvalidCredentialsError when user is inactive", async () => {
    usersService.findById.mockResolvedValue({ isActive: false });

    await expect(useCase.execute("u1")).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });
});
