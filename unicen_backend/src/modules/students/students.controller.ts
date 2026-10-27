import {
  Body,
  Controller,
  Get,
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
import { Roles } from "../../shared/decorators/roles.decorator";
import { Role } from "../../shared/enums/role.enum";
import { CreateStudentDto } from "./dto/create-student.dto";
import { ListStudentsQueryDto } from "./dto/list-students-query.dto";
import { StudentResponseDto } from "./dto/student-response.dto";
import { UpdateStudentStatusDto } from "./dto/update-student-status.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./students.service";

/**
 * Controller handling student HTTP endpoints (ADMIN only).
 */
@ApiTags("Students")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Registers a student (account + profile).
   * @param dto - Student data.
   * @returns The created student.
   */
  @Post()
  @ApiOperation({ summary: "Register a student (ADMIN)" })
  @ApiResponse({ status: HttpStatus.CREATED, type: StudentResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid data" })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Code or email in use",
  })
  create(@Body() dto: CreateStudentDto): Promise<StudentResponseDto> {
    return this.studentsService.create(dto);
  }

  /**
   * Lists students.
   * @param query - Optional search and active filters.
   * @returns The students.
   */
  @Get()
  @ApiOperation({ summary: "List students (ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: [StudentResponseDto] })
  findAll(@Query() query: ListStudentsQueryDto): Promise<StudentResponseDto[]> {
    return this.studentsService.findAll(query);
  }

  /**
   * Gets a student by id.
   * @param id - Student UUID.
   * @returns The student.
   */
  @Get(":id")
  @ApiOperation({ summary: "Get a student (ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: StudentResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<StudentResponseDto> {
    return this.studentsService.findOne(id);
  }

  /**
   * Updates a student.
   * @param id - Student UUID.
   * @param dto - Fields to change.
   * @returns The updated student.
   */
  @Patch(":id")
  @ApiOperation({ summary: "Update a student (ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: StudentResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Code or email in use",
  })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return this.studentsService.update(id, dto);
  }

  /**
   * Activates or deactivates a student.
   * @param id - Student UUID.
   * @param dto - New status.
   * @returns The updated student.
   */
  @Patch(":id/status")
  @ApiOperation({ summary: "Activate or deactivate a student (ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: StudentResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentStatusDto,
  ): Promise<StudentResponseDto> {
    return this.studentsService.updateStatus(id, dto.isActive);
  }
}
