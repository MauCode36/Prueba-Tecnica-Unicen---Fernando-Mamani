import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { Role } from "../../../shared/enums/role.enum";
import { CreateUserDto } from "./create-user.dto";

/**
 * Input payload to create a staff account (ADMIN or TEACHER).
 * Students are created only through `/api/students` so they always get a profile.
 */
export class CreateStaffUserDto extends OmitType(CreateUserDto, [
  "role",
] as const) {
  @ApiProperty({ enum: [Role.ADMIN, Role.TEACHER], example: Role.TEACHER })
  @IsIn([Role.ADMIN, Role.TEACHER], {
    message: "Los estudiantes se registran desde /students",
  })
  role: Role.ADMIN | Role.TEACHER;
}
