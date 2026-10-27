import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Role } from "../enums/role.enum";

/**
 * Represents the authenticated user attached to the HTTP request.
 */
export interface AuthenticatedUser {
  id: string;
  sub: string;
  email: string;
  role: Role;
}

/**
 * Extracts the authenticated user or a specific property from the request.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
