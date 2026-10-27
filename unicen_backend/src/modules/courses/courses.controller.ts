import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  AuthenticatedUser,
  CurrentUser,
} from "../../shared/decorators/current-user.decorator";
import { Roles } from "../../shared/decorators/roles.decorator";
import { Role } from "../../shared/enums/role.enum";
import { CoursesService } from "./courses.service";
import { CourseResponseDto } from "./dto/course-response.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { EnrolledStudentResponseDto } from "./dto/enrolled-student-response.dto";
import { ListCoursesQueryDto } from "./dto/list-courses-query.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

/**
 * Controller handling course HTTP endpoints.
 */
@ApiTags("Courses")
@ApiBearerAuth()
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Lists the course offering, optionally by term or subject.
   * @param query - Optional filters.
   * @param user - Authenticated user.
   * @returns Courses with available seats and `isEnrolled`.
   */
  @Get()
  @ApiOperation({ summary: "List the course offering" })
  @ApiResponse({ status: HttpStatus.OK, type: [CourseResponseDto] })
  findAll(
    @Query() query: ListCoursesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CourseResponseDto[]> {
    return this.coursesService.findAll(query, user);
  }

  /**
   * Lists the courses assigned to the authenticated teacher.
   * @param user - Authenticated teacher.
   * @returns The teacher's courses.
   */
  @Get("mine")
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: "List my assigned courses (TEACHER)" })
  @ApiResponse({ status: HttpStatus.OK, type: [CourseResponseDto] })
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<CourseResponseDto[]> {
    return this.coursesService.findMine(user.id);
  }

  /**
   * Gets a course by id.
   * @param id - Course UUID.
   * @param user - Authenticated user.
   * @returns The course.
   */
  @Get(":id")
  @ApiOperation({ summary: "Get a course" })
  @ApiResponse({ status: HttpStatus.OK, type: CourseResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id, user);
  }

  /**
   * Lists the students enrolled in a course.
   * @param id - Course UUID.
   * @param user - Authenticated user (course teacher or ADMIN).
   * @returns The enrolled students.
   */
  @Get(":id/enrolled-students")
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: "List enrolled students (course teacher or ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: [EnrolledStudentResponseDto] })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Not the teacher" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  findEnrolledStudents(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrolledStudentResponseDto[]> {
    return this.coursesService.findEnrolledStudents(id, user);
  }

  /**
   * Creates a course offering.
   * @param dto - Course data.
   * @returns The created course.
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create a course (ADMIN)" })
  @ApiResponse({ status: HttpStatus.CREATED, type: CourseResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid data" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Subject not found" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Duplicate course" })
  create(@Body() dto: CreateCourseDto): Promise<CourseResponseDto> {
    return this.coursesService.create(dto);
  }

  /**
   * Updates a course.
   * @param id - Course UUID.
   * @param dto - Fields to change.
   * @returns The updated course.
   */
  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update a course (ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: CourseResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid data" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Conflict" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, dto);
  }

  /**
   * Deletes a course without enrollments.
   * @param id - Course UUID.
   */
  @Delete(":id")
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a course (ADMIN)" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Has enrollments" })
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
