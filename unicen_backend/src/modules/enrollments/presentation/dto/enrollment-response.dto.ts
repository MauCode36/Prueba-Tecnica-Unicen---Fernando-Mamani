import { ApiProperty } from "@nestjs/swagger";
import { Enrollment } from "../../domain/enrollment.entity";
import { EnrollmentStatus } from "../../domain/enrollment-status.enum";

/**
 * Result of enrolling or cancelling.
 */
export class EnrollmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty({ enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty()
  enrolledAt: Date;

  /**
   * Maps a domain enrollment to its response.
   * @param enrollment - The domain enrollment.
   * @returns The response DTO.
   */
  static fromDomain(enrollment: Enrollment): EnrollmentResponseDto {
    const dto = new EnrollmentResponseDto();
    dto.id = enrollment.id;
    dto.studentId = enrollment.studentId;
    dto.courseId = enrollment.courseId;
    dto.status = enrollment.status;
    dto.enrolledAt = enrollment.createdAt;
    return dto;
  }
}
