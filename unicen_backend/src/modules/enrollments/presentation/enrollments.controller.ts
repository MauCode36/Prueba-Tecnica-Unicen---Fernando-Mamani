import {
  Body,
  Controller,
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
} from "../../../shared/decorators/current-user.decorator";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { Role } from "../../../shared/enums/role.enum";
import { CancelEnrollmentUseCase } from "../application/cancel-enrollment.use-case";
import { EnrollStudentUseCase } from "../application/enroll-student.use-case";
import { ListEnrollmentsUseCase } from "../application/list-enrollments.use-case";
import { ListMyEnrollmentsUseCase } from "../application/list-my-enrollments.use-case";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { EnrollmentResponseDto } from "./dto/enrollment-response.dto";
import { EnrollmentSummaryResponseDto } from "./dto/enrollment-summary-response.dto";
import { ListEnrollmentsQueryDto } from "./dto/list-enrollments-query.dto";
import { ListMyEnrollmentsQueryDto } from "./dto/list-my-enrollments-query.dto";

/**
 * Controller handling enrollment HTTP endpoints.
 */
@ApiTags("Enrollments")
@ApiBearerAuth()
@Controller("enrollments")
export class EnrollmentsController {
  constructor(
    private readonly enrollStudentUseCase: EnrollStudentUseCase,
    private readonly cancelEnrollmentUseCase: CancelEnrollmentUseCase,
    private readonly listMyEnrollmentsUseCase: ListMyEnrollmentsUseCase,
    private readonly listEnrollmentsUseCase: ListEnrollmentsUseCase,
  ) {}

  /**
   * Enrolls the authenticated student, or any student when called by an ADMIN.
   * @param dto - Course and optional student id.
   * @param user - Authenticated user.
   * @returns The created enrollment.
   */
  @Post()
  @Roles(Role.STUDENT, Role.ADMIN)
  @ApiOperation({ summary: "Enroll in a course (STUDENT) or enroll a student (ADMIN)" })
  @ApiResponse({ status: HttpStatus.CREATED, type: EnrollmentResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid data or missing studentId" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Not allowed" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Course or student not found" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Course full, duplicate or inactive student" })
  async enroll(
    @Body() dto: CreateEnrollmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollStudentUseCase.execute({
      courseId: dto.courseId,
      studentId: dto.studentId,
      actor: { userId: user.id, role: user.role },
    });
    return EnrollmentResponseDto.fromDomain(enrollment);
  }

  /**
   * Lists the authenticated student's active enrollments.
   * @param query - Optional term filter.
   * @param user - Authenticated student.
   * @returns The enrollments.
   */
  @Get("mine")
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: "List my enrollments (STUDENT)" })
  @ApiResponse({ status: HttpStatus.OK, type: [EnrollmentSummaryResponseDto] })
  async findMine(
    @Query() query: ListMyEnrollmentsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrollmentSummaryResponseDto[]> {
    const summaries = await this.listMyEnrollmentsUseCase.execute({
      userId: user.id,
      term: query.term,
    });
    return summaries.map((s) => EnrollmentSummaryResponseDto.fromSummary(s));
  }

  /**
   * Lists enrollments with filters.
   * @param query - Optional student, course, term and status filters.
   * @returns The enrollments.
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "List enrollments (ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: [EnrollmentSummaryResponseDto] })
  async findAll(
    @Query() query: ListEnrollmentsQueryDto,
  ): Promise<EnrollmentSummaryResponseDto[]> {
    const summaries = await this.listEnrollmentsUseCase.execute(query);
    return summaries.map((s) => EnrollmentSummaryResponseDto.fromSummary(s));
  }

  /**
   * Cancels an enrollment (no physical deletion).
   * @param id - Enrollment UUID.
   * @param user - Authenticated user.
   * @returns The cancelled enrollment.
   */
  @Patch(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @Roles(Role.STUDENT, Role.ADMIN)
  @ApiOperation({ summary: "Cancel an enrollment (owner STUDENT or ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: EnrollmentResponseDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Not your enrollment" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Already cancelled or has grades" })
  async cancel(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.cancelEnrollmentUseCase.execute({
      enrollmentId: id,
      actor: { userId: user.id, role: user.role },
    });
    return EnrollmentResponseDto.fromDomain(enrollment);
  }
}
