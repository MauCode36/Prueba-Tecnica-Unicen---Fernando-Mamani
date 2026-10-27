import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  DuplicateSubjectCodeError,
  NotFoundError,
  SubjectInUseError,
} from "../../shared/errors";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "../../shared/utils/postgres-error.utils";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { SubjectResponseDto } from "./dto/subject-response.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { SubjectEntity } from "./subject.entity";

/**
 * Service managing subject operations.
 */
@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly subjectRepository: Repository<SubjectEntity>,
  ) {}

  /**
   * Creates a subject.
   * @param dto - Subject data.
   * @returns The created subject.
   * @throws {DuplicateSubjectCodeError} When the code is already used.
   */
  async create(dto: CreateSubjectDto): Promise<SubjectResponseDto> {
    if (await this.subjectRepository.existsBy({ code: dto.code })) {
      throw new DuplicateSubjectCodeError();
    }
    const saved = await this.saveOrThrowDuplicate(
      this.subjectRepository.create({
        code: dto.code,
        name: dto.name.trim(),
        credits: dto.credits,
      }),
    );
    return SubjectResponseDto.fromEntity(saved);
  }

  /**
   * Lists all subjects ordered by code.
   * @returns The subjects.
   */
  async findAll(): Promise<SubjectResponseDto[]> {
    const subjects = await this.subjectRepository.find({
      order: { code: "ASC" },
    });
    return subjects.map((subject) => SubjectResponseDto.fromEntity(subject));
  }

  /**
   * Finds a subject by id.
   * @param id - Subject UUID.
   * @returns The subject.
   * @throws {NotFoundError} When the subject does not exist.
   */
  async findOne(id: string): Promise<SubjectResponseDto> {
    return SubjectResponseDto.fromEntity(await this.findEntityOrFail(id));
  }

  /**
   * Updates a subject.
   * @param id - Subject UUID.
   * @param dto - Fields to change.
   * @returns The updated subject.
   * @throws {NotFoundError} When the subject does not exist.
   * @throws {DuplicateSubjectCodeError} When the new code belongs to another subject.
   */
  async update(id: string, dto: UpdateSubjectDto): Promise<SubjectResponseDto> {
    const subject = await this.findEntityOrFail(id);
    if (dto.code !== undefined && dto.code !== subject.code) {
      if (await this.subjectRepository.existsBy({ code: dto.code })) {
        throw new DuplicateSubjectCodeError();
      }
      subject.code = dto.code;
    }
    if (dto.name !== undefined) subject.name = dto.name.trim();
    if (dto.credits !== undefined) subject.credits = dto.credits;
    return SubjectResponseDto.fromEntity(
      await this.saveOrThrowDuplicate(subject),
    );
  }

  /**
   * Deletes a subject.
   * @param id - Subject UUID.
   * @throws {NotFoundError} When the subject does not exist.
   * @throws {SubjectInUseError} When the subject still has courses.
   */
  async remove(id: string): Promise<void> {
    await this.findEntityOrFail(id);
    try {
      await this.subjectRepository.delete(id);
    } catch (err) {
      if (isForeignKeyViolation(err)) throw new SubjectInUseError();
      throw err;
    }
  }

  /**
   * Finds a subject entity by id, for use by other modules.
   * @param id - Subject UUID.
   * @returns The subject entity or null.
   */
  findEntityById(id: string): Promise<SubjectEntity | null> {
    return this.subjectRepository.findOne({ where: { id } });
  }

  private async findEntityOrFail(id: string): Promise<SubjectEntity> {
    const subject = await this.findEntityById(id);
    if (!subject) throw new NotFoundError("Materia no encontrada");
    return subject;
  }

  private async saveOrThrowDuplicate(
    subject: SubjectEntity,
  ): Promise<SubjectEntity> {
    try {
      return await this.subjectRepository.save(subject);
    } catch (err) {
      if (isUniqueViolation(err)) throw new DuplicateSubjectCodeError();
      throw err;
    }
  }
}
