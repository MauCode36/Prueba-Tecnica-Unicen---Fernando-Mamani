import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

/**
 * Input payload to enroll in a course.
 */
export class CreateEnrollmentDto {
  @ApiProperty({ description: "Course to enroll in" })
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({
    description: "Student profile id; required for ADMIN, optional for STUDENT",
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;
}
