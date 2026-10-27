import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SubjectEntity } from "../subjects/subject.entity";
import { UserEntity } from "../users/user.entity";

/**
 * Course ORM entity representing a course offering (subject + term + section).
 * Relations are used only for read joins.
 */
@Entity("courses")
export class CourseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "subject_id", type: "uuid" })
  subjectId: string;

  @Column({ name: "teacher_id", type: "uuid" })
  teacherId: string;

  @Column({ type: "varchar", length: 6 })
  term: string;

  @Column({ type: "varchar", length: 10 })
  section: string;

  @Column({ name: "max_capacity", type: "integer" })
  maxCapacity: number;

  @ManyToOne(() => SubjectEntity)
  @JoinColumn({ name: "subject_id" })
  subject: SubjectEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "teacher_id" })
  teacher: UserEntity;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
