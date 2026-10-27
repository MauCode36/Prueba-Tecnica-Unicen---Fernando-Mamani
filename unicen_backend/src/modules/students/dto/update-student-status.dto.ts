import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

/**
 * Input payload to activate or deactivate a student.
 */
export class UpdateStudentStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
