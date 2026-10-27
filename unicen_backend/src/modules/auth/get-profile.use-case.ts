import { Injectable } from "@nestjs/common";
import { InvalidCredentialsError } from "../../shared/errors";
import { UsersService } from "../users/users.service";
import { AuthUserDto } from "./dto/auth-response.dto";

/**
 * Returns the up-to-date profile of the authenticated user.
 */
@Injectable()
export class GetProfileUseCase {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Loads the profile of an authenticated user.
   * @param userId - Id taken from the verified token.
   * @returns The user profile.
   * @throws {InvalidCredentialsError} When the user no longer exists or is inactive.
   */
  async execute(userId: string): Promise<AuthUserDto> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new InvalidCredentialsError("Usuario no encontrado o inactivo");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
