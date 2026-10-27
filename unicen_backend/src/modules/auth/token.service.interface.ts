import { Role } from "../../shared/enums/role.enum";

export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");

/**
 * Payload encoded inside authentication tokens (JWT or PASETO).
 */
export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Token management service port (Adapter pattern).
 */
export interface TokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
