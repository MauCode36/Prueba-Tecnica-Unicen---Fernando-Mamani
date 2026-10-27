import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * TypeORM entity representing the enrollments table.
 */
@Entity("enrollments")
export class EnrollmentOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "student_id", type: "uuid" })
  studentId: string;

  @Column({ name: "course_id", type: "uuid" })
  courseId: string;

  @CreateDateColumn({ name: "enrollment_date" })
  enrollmentDate: Date;
}
