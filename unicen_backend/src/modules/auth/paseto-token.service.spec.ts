import { ConfigService } from "@nestjs/config";
import { Role } from "../../shared/enums/role.enum";
import { PasetoTokenService } from "./paseto-token.service";

const payload = { sub: "u1", email: "a@unicen.edu.bo", role: Role.TEACHER };

const build = (expiresIn = "8h") =>
  new PasetoTokenService({
    get: (key: string) =>
      ({ JWT_EXPIRES_IN: expiresIn, PASETO_SECRET: undefined })[key],
    getOrThrow: () => "a_sufficiently_long_secret",
  } as unknown as ConfigService);

describe("PasetoTokenService", () => {
  it("signs and verifies a valid token payload", async () => {
    const service = build();

    const token = await service.sign(payload);

    expect(token.startsWith("v3.local.")).toBe(true);
    await expect(service.verify(token)).resolves.toEqual(payload);
  });

  it("rejects a tampered token", async () => {
    const service = build();
    const token = await service.sign(payload);
    const tampered =
      token.slice(0, -4) + (token.endsWith("AAAA") ? "BBBB" : "AAAA");

    await expect(service.verify(tampered)).rejects.toThrow();
  });

  it("rejects a token with non-canonical trailing characters", async () => {
    const service = build();
    const token = await service.sign(payload);

    await expect(service.verify(token + "x")).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const service = build("1s");
    const token = await service.sign(payload);
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now + 5000);

    await expect(service.verify(token)).rejects.toThrow("Token expired");
    jest.restoreAllMocks();
  });
});
