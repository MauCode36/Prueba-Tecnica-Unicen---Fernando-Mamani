import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Enrollment } from "../domain/enrollment.entity";
import { EnrollmentRepository } from "../domain/enrollment.repository";
import { EnrollmentOrmEntity } from "./enrollment.orm-entity";

/**
 * TypeORM implementation of the EnrollmentRepository port.
 */
@Injectable()
export class TypeOrmEnrollmentRepository implements EnrollmentRepository {
  constructor(
    @InjectRepository(EnrollmentOrmEntity)
    private readonly ormRepository: Repository<EnrollmentOrmEntity>,
  ) {}

  async save(enrollment: Enrollment): Promise<Enrollment> {
    const orm = this.ormRepository.create({
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      enrollmentDate: enrollment.enrollmentDate,
    });
    const saved = await this.ormRepository.save(orm);
    return new Enrollment(
      saved.id,
      saved.studentId,
      saved.courseId,
      saved.enrollmentDate,
    );
  }

  async findById(id: string): Promise<Enrollment | null> {
    const found = await this.ormRepository.findOne({ where: { id } });
    if (!found) return null;
    return new Enrollment(
      found.id,
      found.studentId,
      found.courseId,
      found.enrollmentDate,
    );
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
