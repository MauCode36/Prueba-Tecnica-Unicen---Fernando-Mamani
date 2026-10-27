import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Grade } from "../domain/grade.entity";
import { GradeRepository } from "../domain/grade.repository";
import { GradeOrmEntity } from "./grade.orm-entity";

/**
 * TypeORM implementation of the GradeRepository port.
 */
@Injectable()
export class TypeOrmGradeRepository implements GradeRepository {
  constructor(
    @InjectRepository(GradeOrmEntity)
    private readonly ormRepository: Repository<GradeOrmEntity>,
  ) {}

  async save(grade: Grade): Promise<Grade> {
    const orm = this.ormRepository.create({
      id: grade.id,
      enrollmentId: grade.enrollmentId,
      value: grade.value,
      recordedAt: grade.recordedAt,
    });
    const saved = await this.ormRepository.save(orm);
    return new Grade(
      saved.id,
      saved.enrollmentId,
      Number(saved.value),
      saved.recordedAt,
    );
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Grade[]> {
    const list = await this.ormRepository.find({ where: { enrollmentId } });
    return list.map(
      (item) =>
        new Grade(
          item.id,
          item.enrollmentId,
          Number(item.value),
          item.recordedAt,
        ),
    );
  }
}
