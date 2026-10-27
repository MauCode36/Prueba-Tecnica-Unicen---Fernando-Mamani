import { IsEnum, IsOptional } from "class-validator";
import { Role } from "../../../shared/enums/role.enum";

/**
 * Query parameters to filter the users list.
 */
export class ListUsersQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
