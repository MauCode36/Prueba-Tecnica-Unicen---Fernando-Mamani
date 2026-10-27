import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID, Matches } from "class-validator";
import { EnrollmentStatus } from "../../domain/enrollment-status.enum";

/**
 * Query filters for listing enrollments (ADMIN).
 */
export class ListEnrollmentsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({ example: "2026-2" })
  @IsOptional()
  @Matches(/^\d{4}-[12]$/, {
    message: "La gestión debe tener el formato AAAA-1 o AAAA-2",
  })
  term?: string;

  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}
