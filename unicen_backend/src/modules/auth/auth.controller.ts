import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { Public } from "../../shared/decorators/public.decorator";
import { AuthUserDto, LoginResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { GetProfileUseCase } from "./get-profile.use-case";
import { LoginUseCase } from "./login.use-case";

/**
 * Controller exposing authentication endpoints.
 */
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  /**
   * Authenticates a user with email and password.
   * @param dto - Credentials.
   * @returns Access token and user data.
   */
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in with email and password" })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid credentials",
  })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  /**
   * Returns the authenticated user's profile.
   * @param user - User attached to the request by the auth guard.
   * @returns The current user data.
   */
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated user's profile" })
  @ApiResponse({ status: HttpStatus.OK, type: AuthUserDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Missing or invalid token",
  })
  me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUserDto> {
    return this.getProfileUseCase.execute(user.id);
  }
}
