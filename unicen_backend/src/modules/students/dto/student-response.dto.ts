import { ApiProperty } from "@nestjs/swagger";
import { StudentEntity } from "../student.entity";

/**
 * Public representation of a student; never exposes the password hash.
 */
export class StudentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  studentCode: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  program: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  /**
   * Maps a student with its `user` relation loaded to the response.
   * @param entity - The student entity with `user` populated.
   * @returns The response DTO.
   */
  static fromEntity(entity: StudentEntity): StudentResponseDto {
    const dto = new StudentResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.studentCode = entity.studentCode;
    dto.name = entity.user.name;
    dto.email = entity.user.email;
    dto.program = entity.program;
    dto.isActive = entity.user.isActive;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
