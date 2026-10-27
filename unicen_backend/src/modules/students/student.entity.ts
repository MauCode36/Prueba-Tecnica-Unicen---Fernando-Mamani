import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../users/user.entity";

/**
 * Student ORM entity: the academic profile linked one-to-one to a user account.
 */
@Entity("students")
export class StudentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id", type: "uuid", unique: true })
  userId: string;

  @Column({ name: "student_code", type: "varchar", length: 20, unique: true })
  studentCode: string;

  @Column({ type: "varchar", length: 150 })
  program: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
