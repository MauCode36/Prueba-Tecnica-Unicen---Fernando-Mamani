import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Creates `subjects`, `courses`, `students` and `enrollments` (E2 schema).
 * `students` and `enrollments` are created here because course seat counts
 * read from them; their business logic arrives with HU-09 and E3.
 */
export class CreateSubjectsAndCourses1761609600000
  implements MigrationInterface
{
  name = "CreateSubjectsAndCourses1761609600000";

  /**
   * Applies the migration.
   * @param queryRunner - Active query runner.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subjects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(20) NOT NULL,
        "name" character varying(150) NOT NULL,
        "credits" smallint NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subjects_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subjects_code" UNIQUE ("code"),
        CONSTRAINT "CHK_subjects_credits" CHECK ("credits" > 0)
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "courses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "subject_id" uuid NOT NULL,
        "teacher_id" uuid NOT NULL,
        "term" character varying(6) NOT NULL,
        "section" character varying(10) NOT NULL,
        "max_capacity" integer NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_courses_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_courses_subject_term_section" UNIQUE ("subject_id", "term", "section"),
        CONSTRAINT "CHK_courses_max_capacity" CHECK ("max_capacity" > 0),
        CONSTRAINT "CHK_courses_term" CHECK ("term" ~ '^[0-9]{4}-[12]$'),
        CONSTRAINT "FK_courses_subject" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_courses_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_term" ON "courses" ("term")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_teacher_id" ON "courses" ("teacher_id")`,
    );
    await queryRunner.query(
      `CREATE TABLE "students" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "student_code" character varying(20) NOT NULL,
        "program" character varying(150) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_students_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_students_user_id" UNIQUE ("user_id"),
        CONSTRAINT "UQ_students_student_code" UNIQUE ("student_code"),
        CONSTRAINT "FK_students_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )`,
    );
    await queryRunner.query(
      `CREATE TYPE "enrollments_status_enum" AS ENUM ('ACTIVE', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "enrollments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "student_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "status" "enrollments_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enrollments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_enrollments_student_course" UNIQUE ("student_id", "course_id"),
        CONSTRAINT "FK_enrollments_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_enrollments_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT
      )`,
    );
  }

  /**
   * Reverts the migration in reverse dependency order.
   * @param queryRunner - Active query runner.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "enrollments"`);
    await queryRunner.query(`DROP TYPE "enrollments_status_enum"`);
    await queryRunner.query(`DROP TABLE "students"`);
    await queryRunner.query(`DROP TABLE "courses"`);
    await queryRunner.query(`DROP TABLE "subjects"`);
  }
}
