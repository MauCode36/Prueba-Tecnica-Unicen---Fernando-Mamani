import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Not, Repository } from "typeorm";
import { Role } from "../../shared/enums/role.enum";
import {
  DuplicateStudentCodeError,
  DuplicateUserEmailError,
  NotFoundError,
} from "../../shared/errors";
import {
  getViolatedConstraint,
  isUniqueViolation,
} from "../../shared/utils/postgres-error.utils";
import { UsersService } from "../users/users.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { ListStudentsQueryDto } from "./dto/list-students-query.dto";
import { StudentResponseDto } from "./dto/student-response.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentEntity } from "./student.entity";

/**
 * Service managing student operations (account + academic profile).
 */
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates the STUDENT user and its profile in one transaction.
   * @param dto - Student data.
   * @returns The created student.
   * @throws {DuplicateStudentCodeError} When the student code is already used.
   * @throws {DuplicateUserEmailError} When the email is already registered.
   */
  async create(dto: CreateStudentDto): Promise<StudentResponseDto> {
    try {
      const id = await this.dataSource.transaction(async (manager) => {
        const codeTaken = await manager.existsBy(StudentEntity, {
          studentCode: dto.studentCode,
        });
        if (codeTaken) throw new DuplicateStudentCodeError();
        const user = await this.usersService.create(
          {
            name: dto.name,
            email: dto.email,
            password: dto.password,
            role: Role.STUDENT,
          },
          manager,
        );
        const saved = await manager.save(
          manager.create(StudentEntity, {
            userId: user.id,
            studentCode: dto.studentCode,
            program: dto.program.trim(),
          }),
        );
        return saved.id;
      });
      return await this.findOne(id);
    } catch (err) {
      throw this.translateUniqueViolation(err);
    }
  }

  /**
   * Lists students, optionally filtered by text and active flag.
   * @param query - Optional filters.
   * @returns The matching students ordered by name.
   */
  async findAll(query: ListStudentsQueryDto): Promise<StudentResponseDto[]> {
    const qb = this.studentRepository
      .createQueryBuilder("s")
      .innerJoinAndSelect("s.user", "u")
      .orderBy("u.name", "ASC");
    if (query.search) {
      qb.andWhere(
        "(u.name ILIKE :search OR u.email ILIKE :search OR s.student_code ILIKE :search)",
        { search: `%${query.search}%` },
      );
    }
    if (query.isActive !== undefined) {
      qb.andWhere("u.is_active = :isActive", { isActive: query.isActive });
    }
    const students = await qb.getMany();
    return students.map((student) => StudentResponseDto.fromEntity(student));
  }

  /**
   * Finds a student by id.
   * @param id - Student UUID.
   * @returns The student.
   * @throws {NotFoundError} When the student does not exist.
   */
  async findOne(id: string): Promise<StudentResponseDto> {
    const student = await this.findById(id);
    if (!student) throw new NotFoundError("Estudiante no encontrado");
    return StudentResponseDto.fromEntity(student);
  }

  /**
   * Updates account and profile data in one transaction.
   * @param id - Student UUID.
   * @param dto - Fields to change.
   * @returns The updated student.
   * @throws {NotFoundError} When the student does not exist.
   * @throws {DuplicateStudentCodeError} When the code belongs to another student.
   * @throws {DuplicateUserEmailError} When the email belongs to another user.
   */
  async update(id: string, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const student = await manager.findOne(StudentEntity, { where: { id } });
        if (!student) throw new NotFoundError("Estudiante no encontrado");
        await this.assertCodeAvailable(manager, student, dto.studentCode);
        await this.usersService.update(
          student.userId,
          { name: dto.name, email: dto.email },
          manager,
        );
        if (dto.studentCode !== undefined) {
          student.studentCode = dto.studentCode;
        }
        if (dto.program !== undefined) student.program = dto.program.trim();
        await manager.save(student);
      });
      return await this.findOne(id);
    } catch (err) {
      throw this.translateUniqueViolation(err);
    }
  }

  /**
   * Activates or deactivates the student account. Enrollments are not touched.
   * @param id - Student UUID.
   * @param isActive - New active flag.
   * @returns The updated student.
   * @throws {NotFoundError} When the student does not exist.
   */
  async updateStatus(
    id: string,
    isActive: boolean,
  ): Promise<StudentResponseDto> {
    const student = await this.findById(id);
    if (!student) throw new NotFoundError("Estudiante no encontrado");
    await this.usersService.update(student.userId, { isActive });
    return this.findOne(id);
  }

  /**
   * Finds a student profile (with its user) by account id, for other modules.
   * @param userId - User UUID.
   * @returns The student or null.
   */
  findByUserId(userId: string): Promise<StudentEntity | null> {
    return this.studentRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  /**
   * Finds a student profile (with its user) by id, for other modules.
   * @param id - Student UUID.
   * @returns The student or null.
   */
  findById(id: string): Promise<StudentEntity | null> {
    return this.studentRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  private async assertCodeAvailable(
    manager: EntityManager,
    student: StudentEntity,
    studentCode?: string,
  ): Promise<void> {
    if (studentCode === undefined || studentCode === student.studentCode) {
      return;
    }
    const taken = await manager.existsBy(StudentEntity, {
      studentCode,
      id: Not(student.id),
    });
    if (taken) throw new DuplicateStudentCodeError();
  }

  private translateUniqueViolation(err: unknown): unknown {
    if (!isUniqueViolation(err)) return err;
    return getViolatedConstraint(err)?.includes("student_code")
      ? new DuplicateStudentCodeError()
      : new DuplicateUserEmailError();
  }
}
