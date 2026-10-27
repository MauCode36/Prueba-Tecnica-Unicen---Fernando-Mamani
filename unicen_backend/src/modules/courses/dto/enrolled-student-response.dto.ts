import { ApiProperty } from "@nestjs/swagger";
import { EnrolledStudentView } from "../course-view.type";

/**
 * Public representation of a student enrolled in a course.
 */
export class EnrolledStudentResponseDto {
  @ApiProperty()
  enrollmentId: string;

  @ApiProperty({ description: "students.id (academic profile)" })
  studentId: string;

  @ApiProperty()
  studentCode: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  program: string;

  @ApiProperty()
  enrolledAt: Date;

  /**
   * Maps a read projection to its response.
   * @param view - The enrolled student projection.
   * @returns The response DTO.
   */
  static fromView(view: EnrolledStudentView): EnrolledStudentResponseDto {
    return Object.assign(new EnrolledStudentResponseDto(), view);
  }
}
