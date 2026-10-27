import { SetMetadata } from "@nestjs/common";
import { Role } from "../enums/role.enum";

export const ROLES_KEY = "roles";

/**
 * Decorator to assign required roles to endpoints.
 * @param roles - Roles allowed to access the route.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
