import { Role } from "../../../shared/enums/role.enum";

/**
 * The authenticated user performing an enrollment operation.
 */
export interface EnrollmentActor {
  userId: string;
  role: Role;
}
