import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../../../shared/enums/role.enum";
import { UserEntity } from "../user.entity";

/**
 * Public representation of a user; never exposes the password hash.
 */
export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  /**
   * Maps a persisted user to its response representation.
   * @param entity - The user entity.
   * @returns The response DTO without sensitive fields.
   */
  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.role = entity.role;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
