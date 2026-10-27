import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import {
  TOKEN_SERVICE,
  TokenService,
} from "../../modules/auth/token.service.interface";
import { AuthenticatedUser } from "../decorators/current-user.decorator";

/**
 * Global authentication guard that validates Bearer tokens (JWT or PASETO).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Validates if the current request is public or carries a valid Bearer token.
   * @param context - Execution context of the request.
   * @returns True if access is granted.
   * @throws {UnauthorizedException} When the token is missing, invalid or expired.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("No autenticado. Token requerido.");
    }

    try {
      const payload = await this.tokenService.verify(token);
      request.user = {
        id: payload.sub,
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Sesión inválida o expirada.");
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
