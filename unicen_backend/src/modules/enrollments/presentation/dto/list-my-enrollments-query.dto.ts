import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, Matches } from "class-validator";

/**
 * Query filters for listing the authenticated student's enrollments.
 */
export class ListMyEnrollmentsQueryDto {
  @ApiPropertyOptional({ example: "2026-2" })
  @IsOptional()
  @Matches(/^\d{4}-[12]$/, {
    message: "La gestión debe tener el formato AAAA-1 o AAAA-2",
  })
  term?: string;
}
