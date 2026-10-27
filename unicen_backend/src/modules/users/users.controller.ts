import { Body, Controller, Get, HttpStatus, Post, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { Role } from "../../shared/enums/role.enum";
import { CreateStaffUserDto } from "./dto/create-staff-user.dto";
import { ListUsersQueryDto } from "./dto/list-users-query.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UsersService } from "./users.service";

/**
 * Controller handling user-related HTTP endpoints (ADMIN only).
 */
@ApiTags("Users")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user account.
   * @param dto - User data.
   * @returns The created user.
   */
  @Post()
  @ApiOperation({ summary: "Create a user (ADMIN)" })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "Email in use" })
  create(@Body() dto: CreateStaffUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  /**
   * Lists users, optionally filtered by role.
   * @param query - Optional filters.
   * @returns The users list.
   */
  @Get()
  @ApiOperation({ summary: "List users (ADMIN)" })
  @ApiQuery({ name: "role", enum: Role, required: false })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
  findAll(@Query() query: ListUsersQueryDto): Promise<UserResponseDto[]> {
    return this.usersService.findAll(query.role);
  }
}
