import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds read indexes used by the enrollment lock/count and the seat projection.
 */
export class AddEnrollmentsIndexes1761696000000 implements MigrationInterface {
  name = "AddEnrollmentsIndexes1761696000000";

  /**
   * Applies the migration.
   * @param queryRunner - Active query runner.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_enrollments_course_status" ON "enrollments" ("course_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_students_program" ON "students" ("program")`,
    );
  }

  /**
   * Reverts the migration.
   * @param queryRunner - Active query runner.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_students_program"`);
    await queryRunner.query(`DROP INDEX "IDX_enrollments_course_status"`);
  }
}
