import { ApiProperty } from "@nestjs/swagger";
import { EnrollmentStatus } from "../../domain/enrollment-status.enum";
import { EnrollmentSummary } from "../../domain/enrollment-summary";

/**
 * Subject summary inside an enrollment course.
 */
export class EnrollmentSubjectDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  credits: number;
}

/**
 * Course summary inside an enrollment.
 */
export class EnrollmentCourseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: "2026-2" })
  term: string;

  @ApiProperty()
  section: string;

  @ApiProperty({ type: EnrollmentSubjectDto })
  subject: EnrollmentSubjectDto;

  @ApiProperty({ example: { name: "Dr. Carlos Mendoza" } })
  teacher: { name: string };
}

/**
 * Student summary inside an enrollment.
 */
export class EnrollmentStudentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentCode: string;

  @ApiProperty()
  name: string;
}

/**
 * Enrollment with its student and course details.
 */
export class EnrollmentSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty()
  enrolledAt: Date;

  @ApiProperty({ type: EnrollmentStudentDto })
  student: EnrollmentStudentDto;

  @ApiProperty({ type: EnrollmentCourseDto })
  course: EnrollmentCourseDto;

  /**
   * Maps a read model to its response.
   * @param summary - The enrollment summary.
   * @returns The response DTO.
   */
  static fromSummary(summary: EnrollmentSummary): EnrollmentSummaryResponseDto {
    return Object.assign(new EnrollmentSummaryResponseDto(), summary);
  }
}
