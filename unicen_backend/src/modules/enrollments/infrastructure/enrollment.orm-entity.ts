import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Lifecycle status of an enrollment.
 */
export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
}

/**
 * TypeORM entity representing the enrollments table.
 * `studentId` references `students.id` (the academic profile), not `users.id`.
 */
@Entity("enrollments")
export class EnrollmentOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "student_id", type: "uuid" })
  studentId: string;

  @Column({ name: "course_id", type: "uuid" })
  courseId: string;

  @Column({
    type: "enum",
    enum: EnrollmentStatus,
    enumName: "enrollments_status_enum",
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
