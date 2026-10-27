import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenPayload, TokenService } from "./token.service.interface";

/**
 * JWT adapter of the {@link TokenService} port.
 */
@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Signs a JWT carrying the given payload.
   * @param payload - Claims to encode.
   * @returns The signed token.
   */
  async sign(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync({ ...payload });
  }

  /**
   * Verifies signature and expiration of a JWT.
   * @param token - The token to verify.
   * @returns The decoded payload.
   * @throws When the token is invalid or expired.
   */
  async verify(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token);
  }
}
