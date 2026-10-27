import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TokenPayload, TokenService } from "./token.service.interface";

const HEADER = "v3.local.";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

interface PasetoClaims extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * PASETO-style (`v3.local.`) adapter of the {@link TokenService} port.
 * Uses authenticated encryption (AES-256-GCM) from `node:crypto`; it is a
 * simplified implementation, not interoperable with the official spec.
 */
@Injectable()
export class PasetoTokenService implements TokenService {
  private readonly key: Buffer;
  private readonly ttlSeconds: number;

  constructor(configService: ConfigService) {
    const secret =
      configService.get<string>("PASETO_SECRET") ||
      configService.getOrThrow<string>("JWT_SECRET");
    this.key = createHash("sha256").update(secret).digest();
    this.ttlSeconds = PasetoTokenService.parseTtl(
      configService.get<string>("JWT_EXPIRES_IN") ?? "8h",
    );
  }

  /**
   * Issues an encrypted token with `iat` and `exp` claims.
   * @param payload - Claims to encode.
   * @returns The `v3.local.` token.
   */
  sign(payload: TokenPayload): Promise<string> {
    return Promise.resolve().then(() => this.encrypt(payload));
  }

  private encrypt(payload: TokenPayload): string {
    const iat = Math.floor(Date.now() / 1000);
    const claims: PasetoClaims = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      iat,
      exp: iat + this.ttlSeconds,
    };
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(claims), "utf8"),
      cipher.final(),
    ]);
    const body = Buffer.concat([iv, encrypted, cipher.getAuthTag()]);
    return HEADER + body.toString("base64url");
  }

  /**
   * Decrypts and validates a token.
   * @param token - The token to verify.
   * @returns The decoded payload.
   * @throws {Error} When the token is malformed, tampered or expired.
   */
  verify(token: string): Promise<TokenPayload> {
    return Promise.resolve().then(() => this.decrypt(token));
  }

  private decrypt(token: string): TokenPayload {
    if (!token.startsWith(HEADER)) {
      throw new Error("Invalid token header");
    }
    const encoded = token.slice(HEADER.length);
    const body = Buffer.from(encoded, "base64url");
    if (body.toString("base64url") !== encoded) {
      throw new Error("Invalid token encoding");
    }
    if (body.length <= IV_LENGTH + TAG_LENGTH) {
      throw new Error("Invalid token body");
    }
    const iv = body.subarray(0, IV_LENGTH);
    const tag = body.subarray(body.length - TAG_LENGTH);
    const encrypted = body.subarray(IV_LENGTH, body.length - TAG_LENGTH);
    const decipher = createDecipheriv("aes-256-gcm", this.key, iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    const claims = JSON.parse(json) as PasetoClaims;
    if (claims.exp <= Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired");
    }
    return { sub: claims.sub, email: claims.email, role: claims.role };
  }

  private static parseTtl(value: string): number {
    const match = /^(\d+)([smhd])?$/.exec(value.trim());
    if (!match) {
      throw new Error(`Invalid JWT_EXPIRES_IN value: ${value}`);
    }
    return Number(match[1]) * UNIT_SECONDS[match[2] ?? "s"];
  }
}
