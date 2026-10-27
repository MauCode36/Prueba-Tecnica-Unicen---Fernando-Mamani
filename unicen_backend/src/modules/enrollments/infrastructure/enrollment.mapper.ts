import { Enrollment } from "../domain/enrollment.entity";
import { EnrollmentOrmEntity } from "./enrollment.orm-entity";

/**
 * Maps an ORM row to the domain enrollment.
 * @param orm - The persisted row.
 * @returns The domain enrollment.
 */
export function toDomain(orm: EnrollmentOrmEntity): Enrollment {
  return new Enrollment(
    orm.id,
    orm.studentId,
    orm.courseId,
    orm.status,
    orm.createdAt,
  );
}

/**
 * Maps a domain enrollment to a plain ORM payload.
 * @param enrollment - The domain enrollment.
 * @returns The fields to persist.
 */
export function toOrm(enrollment: Enrollment): Partial<EnrollmentOrmEntity> {
  return {
    id: enrollment.id,
    studentId: enrollment.studentId,
    courseId: enrollment.courseId,
    status: enrollment.status,
    createdAt: enrollment.createdAt,
  };
}
