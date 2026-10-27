import { ApiProperty } from "@nestjs/swagger";
import { CourseView } from "../course-view.type";

/**
 * Subject summary embedded in a course response.
 */
export class CourseSubjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  credits: number;
}

/**
 * Teacher summary embedded in a course response (never exposes email or hash).
 */
export class CourseTeacherDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

/**
 * Public representation of a course with seat availability.
 */
export class CourseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: "2026-2" })
  term: string;

  @ApiProperty()
  section: string;

  @ApiProperty()
  maxCapacity: number;

  @ApiProperty()
  enrolledCount: number;

  @ApiProperty()
  availableSeats: number;

  @ApiProperty()
  isEnrolled: boolean;

  @ApiProperty({ type: CourseSubjectDto })
  subject: CourseSubjectDto;

  @ApiProperty({ type: CourseTeacherDto })
  teacher: CourseTeacherDto;

  /**
   * Maps a read projection to its response, computing available seats.
   * @param view - The course projection.
   * @returns The response DTO.
   */
  static fromView(view: CourseView): CourseResponseDto {
    const dto = new CourseResponseDto();
    dto.id = view.id;
    dto.term = view.term;
    dto.section = view.section;
    dto.maxCapacity = view.maxCapacity;
    dto.enrolledCount = view.enrolledCount;
    dto.availableSeats = Math.max(view.maxCapacity - view.enrolledCount, 0);
    dto.isEnrolled = view.isEnrolled;
    dto.subject = { ...view.subject };
    dto.teacher = { id: view.teacher.id, name: view.teacher.name };
    return dto;
  }
}
