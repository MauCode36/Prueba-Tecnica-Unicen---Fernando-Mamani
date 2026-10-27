import { ApiProperty } from "@nestjs/swagger";
import { SubjectEntity } from "../subject.entity";

/**
 * Public representation of a subject.
 */
export class SubjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  credits: number;

  @ApiProperty()
  createdAt: Date;

  /**
   * Maps a persisted subject to its response representation.
   * @param entity - The subject entity.
   * @returns The response DTO.
   */
  static fromEntity(entity: SubjectEntity): SubjectResponseDto {
    const dto = new SubjectResponseDto();
    dto.id = entity.id;
    dto.code = entity.code;
    dto.name = entity.name;
    dto.credits = entity.credits;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
