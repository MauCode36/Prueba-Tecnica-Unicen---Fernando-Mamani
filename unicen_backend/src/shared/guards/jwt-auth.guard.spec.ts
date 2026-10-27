import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../enums/role.enum";
import { TokenService } from "../../modules/auth/token.service.interface";
import { JwtAuthGuard } from "./jwt-auth.guard";

const buildContext = (request: object): ExecutionContext =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe("JwtAuthGuard", () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let tokenService: jest.Mocked<TokenService>;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    tokenService = { sign: jest.fn(), verify: jest.fn() };
    guard = new JwtAuthGuard(reflector as unknown as Reflector, tokenService);
  });

  it("allows access on @Public() routes without token", async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(
      guard.canActivate(buildContext({ headers: {} })),
    ).resolves.toBe(true);
  });

  it("throws UnauthorizedException when Bearer token is missing", async () => {
    await expect(
      guard.canActivate(buildContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("throws UnauthorizedException when token is invalid", async () => {
    tokenService.verify.mockRejectedValue(new Error("bad"));

    await expect(
      guard.canActivate(
        buildContext({ headers: { authorization: "Bearer bad" } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("attaches the user to the request when token is valid", async () => {
    tokenService.verify.mockResolvedValue({
      sub: "u1",
      email: "a@b.com",
      role: Role.ADMIN,
    });
    const request: { headers: object; user?: unknown } = {
      headers: { authorization: "Bearer good" },
    };

    await guard.canActivate(buildContext(request));

    expect(request.user).toEqual({
      id: "u1",
      sub: "u1",
      email: "a@b.com",
      role: Role.ADMIN,
    });
  });
});
