import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { Role } from "../../shared/enums/role.enum";
import { DuplicateUserEmailError } from "../../shared/errors";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserEntity } from "./user.entity";

const BCRYPT_ROUNDS = 10;

/**
 * Service managing user operations.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Creates a user with a bcrypt-hashed password.
   * @param dto - User data.
   * @returns The created user without the password hash.
   * @throws {DuplicateUserEmailError} When the email is already registered.
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const email = dto.email.trim().toLowerCase();
    if (await this.findByEmail(email)) {
      throw new DuplicateUserEmailError();
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const saved = await this.userRepository.save(
      this.userRepository.create({
        name: dto.name.trim(),
        email,
        passwordHash,
        role: dto.role,
      }),
    );
    return UserResponseDto.fromEntity(saved);
  }

  /**
   * Lists users, newest first.
   * @param role - Optional role filter.
   * @returns The matching users without password hashes.
   */
  async findAll(role?: Role): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      where: role ? { role } : {},
      order: { createdAt: "DESC" },
    });
    return users.map((user) => UserResponseDto.fromEntity(user));
  }

  /**
   * Finds a user by email (normalized).
   * @param email - Email address.
   * @returns The user or null.
   */
  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  /**
   * Finds a user by id.
   * @param id - User UUID.
   * @returns The user or null.
   */
  findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
