import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { EntityManager, Repository } from "typeorm";
import { Role } from "../../shared/enums/role.enum";
import { DuplicateUserEmailError, NotFoundError } from "../../shared/errors";
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
   * @param manager - Optional transaction manager to join the caller's transaction.
   * @returns The created user without the password hash.
   * @throws {DuplicateUserEmailError} When the email is already registered.
   */
  async create(
    dto: CreateUserDto,
    manager?: EntityManager,
  ): Promise<UserResponseDto> {
    const repository = this.repositoryFor(manager);
    const email = dto.email.trim().toLowerCase();
    if (await repository.findOne({ where: { email } })) {
      throw new DuplicateUserEmailError();
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const saved = await repository.save(
      repository.create({
        name: dto.name.trim(),
        email,
        passwordHash,
        role: dto.role,
      }),
    );
    return UserResponseDto.fromEntity(saved);
  }

  /**
   * Updates the name, email or active flag of a user.
   * @param id - User UUID.
   * @param data - Fields to change.
   * @param manager - Optional transaction manager to join the caller's transaction.
   * @returns The updated user entity.
   * @throws {NotFoundError} When the user does not exist.
   * @throws {DuplicateUserEmailError} When the email belongs to another user.
   */
  async update(
    id: string,
    data: { name?: string; email?: string; isActive?: boolean },
    manager?: EntityManager,
  ): Promise<UserEntity> {
    const repository = this.repositoryFor(manager);
    const user = await repository.findOne({ where: { id } });
    if (!user) throw new NotFoundError("Usuario no encontrado");
    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      const other = await repository.findOne({ where: { email } });
      if (other && other.id !== id) throw new DuplicateUserEmailError();
      user.email = email;
    }
    if (data.name !== undefined) user.name = data.name.trim();
    if (data.isActive !== undefined) user.isActive = data.isActive;
    return repository.save(user);
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

  private repositoryFor(manager?: EntityManager): Repository<UserEntity> {
    return manager ? manager.getRepository(UserEntity) : this.userRepository;
  }
}
