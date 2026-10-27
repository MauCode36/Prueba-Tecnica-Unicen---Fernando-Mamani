import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { DuplicateEnrollmentError } from "../../../shared/errors";
import { isUniqueViolation } from "../../../shared/utils/postgres-error.utils";
import { CoursesService } from "../../courses/courses.service";
import { Enrollment } from "../domain/enrollment.entity";
import { EnrollmentStatus } from "../domain/enrollment-status.enum";
import {
  EnrollmentFilters,
  EnrollmentSummary,
} from "../domain/enrollment-summary";
import {
  EnrollmentRepository,
  LockedCourseContext,
} from "../domain/enrollment.repository";
import { toDomain, toOrm } from "./enrollment.mapper";
import { EnrollmentOrmEntity } from "./enrollment.orm-entity";
import { queryEnrollmentSummaries } from "./enrollment-summary.query";

/**
 * TypeORM implementation of the EnrollmentRepository port.
 */
@Injectable()
export class TypeOrmEnrollmentRepository implements EnrollmentRepository {
  constructor(
    @InjectRepository(EnrollmentOrmEntity)
    private readonly ormRepository: Repository<EnrollmentOrmEntity>,
    private readonly dataSource: DataSource,
    private readonly coursesService: CoursesService,
  ) {}

  /**
   * Runs `work` in one transaction with the course row locked (FOR UPDATE).
   * A unique violation (race outside the lock) becomes a duplicate enrollment error.
   * @param courseId - Course to lock.
   * @param work - Callback receiving the locked-course operations.
   * @returns The callback result.
   */
  async withLockedCourse<T>(
    courseId: string,
    work: (tx: LockedCourseContext) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const course = await this.coursesService.lockForEnrollment(
          courseId,
          manager,
        );
        return work(this.buildContext(manager, courseId, course));
      });
    } catch (err) {
      if (isUniqueViolation(err)) throw new DuplicateEnrollmentError();
      throw err;
    }
  }

  /**
   * Finds an enrollment by id.
   * @param id - Enrollment UUID.
   * @returns The enrollment or null.
   */
  async findById(id: string): Promise<Enrollment | null> {
    const found = await this.ormRepository.findOne({ where: { id } });
    return found ? toDomain(found) : null;
  }

  /**
   * Persists an enrollment (insert or update).
   * @param enrollment - The domain enrollment.
   * @returns The persisted enrollment.
   */
  async save(enrollment: Enrollment): Promise<Enrollment> {
    const saved = await this.ormRepository.save(
      this.ormRepository.create(toOrm(enrollment)),
    );
    return toDomain(saved);
  }

  /**
   * Lists enrollment summaries with student and course details.
   * @param filters - Optional filters.
   * @returns The matching summaries.
   */
  findSummaries(filters: EnrollmentFilters): Promise<EnrollmentSummary[]> {
    return queryEnrollmentSummaries(this.dataSource, filters);
  }

  private buildContext(
    manager: EntityManager,
    courseId: string,
    course: { id: string; maxCapacity: number } | null,
  ): LockedCourseContext {
    return {
      course,
      countActive: () =>
        manager.count(EnrollmentOrmEntity, {
          where: { courseId, status: EnrollmentStatus.ACTIVE },
        }),
      findByStudent: async (studentId) => {
        const found = await manager.findOne(EnrollmentOrmEntity, {
          where: { courseId, studentId },
        });
        return found ? toDomain(found) : null;
      },
      save: async (enrollment) => {
        const saved = await manager.save(
          manager.create(EnrollmentOrmEntity, toOrm(enrollment)),
        );
        return toDomain(saved);
      },
    };
  }
}
