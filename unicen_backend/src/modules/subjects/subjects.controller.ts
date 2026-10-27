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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { Role } from "../../shared/enums/role.enum";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { SubjectResponseDto } from "./dto/subject-response.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { SubjectsService } from "./subjects.service";

/**
 * Controller handling subject HTTP endpoints.
 */
@ApiTags("Subjects")
@ApiBearerAuth()
@Controller("subjects")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  /**
   * Lists the subject catalog.
   * @returns All subjects ordered by code.
   */
  @Get()
  @ApiOperation({ summary: "List subjects" })
  @ApiResponse({ status: HttpStatus.OK, type: [SubjectResponseDto] })
  findAll(): Promise<SubjectResponseDto[]> {
    return this.subjectsService.findAll();
  }

  /**
   * Gets a subject by id.
   * @param id - Subject UUID.
   * @returns The subject.
   */
  @Get(":id")
  @ApiOperation({ summary: "Get a subject" })
  @ApiResponse({ status: HttpStatus.OK, type: SubjectResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<SubjectResponseDto> {
    return this.subjectsService.findOne(id);
  }

  /**
   * Creates a subject.
   * @param dto - Subject data.
   * @returns The created subject.
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create a subject (ADMIN)" })
  @ApiResponse({ status: HttpStatus.CREATED, type: SubjectResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid data" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Code in use" })
  create(@Body() dto: CreateSubjectDto): Promise<SubjectResponseDto> {
    return this.subjectsService.create(dto);
  }

  /**
   * Updates a subject.
   * @param id - Subject UUID.
   * @param dto - Fields to change.
   * @returns The updated subject.
   */
  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update a subject (ADMIN)" })
  @ApiResponse({ status: HttpStatus.OK, type: SubjectResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Code in use" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubjectDto,
  ): Promise<SubjectResponseDto> {
    return this.subjectsService.update(id, dto);
  }

  /**
   * Deletes a subject without courses.
   * @param id - Subject UUID.
   */
  @Delete(":id")
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a subject (ADMIN)" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Not found" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Has courses" })
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.subjectsService.remove(id);
  }
}
