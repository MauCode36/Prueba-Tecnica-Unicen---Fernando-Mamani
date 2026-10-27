import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../../../shared/enums/role.enum";

/**
 * Minimal authenticated user representation.
 */
export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;
}

/**
 * Response of a successful login.
 */
export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
