import { Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { InvalidCredentialsError } from "../../shared/errors";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/auth-response.dto";
import { TOKEN_SERVICE, TokenService } from "./token.service.interface";

/**
 * Authenticates a user by email and password and issues an access token.
 */
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersService: UsersService,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Validates credentials and signs a token.
   * @param dto - Email and password.
   * @returns The access token and the authenticated user.
   * @throws {InvalidCredentialsError} When the user is unknown, inactive or the password mismatches.
   */
  async execute(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new InvalidCredentialsError();
    }
    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new InvalidCredentialsError();
    }
    const accessToken = await this.tokenService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
