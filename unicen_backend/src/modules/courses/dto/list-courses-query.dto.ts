import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID, Matches } from "class-validator";
import { TERM_MESSAGE, TERM_REGEX } from "./create-course.dto";

/**
 * Query filters for listing courses.
 */
export class ListCoursesQueryDto {
  @ApiPropertyOptional({ example: "2026-2" })
  @IsOptional()
  @Matches(TERM_REGEX, { message: TERM_MESSAGE })
  term?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subjectId?: string;
}
