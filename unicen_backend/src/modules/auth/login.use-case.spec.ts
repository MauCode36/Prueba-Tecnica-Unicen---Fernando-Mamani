import * as bcrypt from "bcrypt";
import { Role } from "../../shared/enums/role.enum";
import { InvalidCredentialsError } from "../../shared/errors";
import { UserEntity } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { LoginUseCase } from "./login.use-case";
import { TokenService } from "./token.service.interface";

describe("LoginUseCase", () => {
  let usersService: { findByEmail: jest.Mock };
  let tokenService: jest.Mocked<TokenService>;
  let useCase: LoginUseCase;
  let user: UserEntity;

  beforeEach(async () => {
    user = {
      id: "u1",
      name: "Admin",
      email: "admin@unicen.edu.bo",
      passwordHash: await bcrypt.hash("Admin123!", 4),
      role: Role.ADMIN,
      isActive: true,
    } as UserEntity;
    usersService = { findByEmail: jest.fn().mockResolvedValue(user) };
    tokenService = {
      sign: jest.fn().mockResolvedValue("tok"),
      verify: jest.fn(),
    };
    useCase = new LoginUseCase(
      usersService as unknown as UsersService,
      tokenService,
    );
  });

  it("returns accessToken and user when credentials are valid", async () => {
    const result = await useCase.execute({
      email: user.email,
      password: "Admin123!",
    });

    expect(result).toEqual({
      accessToken: "tok",
      user: { id: "u1", name: "Admin", email: user.email, role: Role.ADMIN },
    });
    expect(tokenService.sign).toHaveBeenCalledWith({
      sub: "u1",
      email: user.email,
      role: Role.ADMIN,
    });
  });

  it("throws InvalidCredentialsError when email does not exist", async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: "x@y.com", password: "Admin123!" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("throws InvalidCredentialsError when password does not match", async () => {
    await expect(
      useCase.execute({ email: user.email, password: "wrong" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("throws InvalidCredentialsError when user is inactive", async () => {
    user.isActive = false;

    await expect(
      useCase.execute({ email: user.email, password: "Admin123!" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
