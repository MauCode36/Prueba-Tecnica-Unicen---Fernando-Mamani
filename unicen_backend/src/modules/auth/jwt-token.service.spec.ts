import { JwtService } from "@nestjs/jwt";
import { Role } from "../../shared/enums/role.enum";
import { JwtTokenService } from "./jwt-token.service";

const payload = { sub: "u1", email: "a@unicen.edu.bo", role: Role.ADMIN };

describe("JwtTokenService", () => {
  const build = (expiresIn: string | number = "1h") =>
    new JwtTokenService(
      new JwtService({
        secret: "a_sufficiently_long_secret",
        signOptions: { expiresIn: expiresIn as number },
      }),
    );

  it("signs and verifies a valid token payload", async () => {
    const service = build();

    const token = await service.sign(payload);
    const decoded = await service.verify(token);

    expect(decoded).toMatchObject(payload);
  });

  it("rejects a tampered token", async () => {
    const service = build();
    const token = await service.sign(payload);

    await expect(service.verify(token + "x")).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const service = build(-10);
    const token = await service.sign(payload);

    await expect(service.verify(token)).rejects.toThrow();
  });
});
