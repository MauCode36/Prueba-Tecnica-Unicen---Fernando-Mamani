import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * TypeORM entity representing the grades table.
 */
@Entity("grades")
export class GradeOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "enrollment_id", type: "uuid" })
  enrollmentId: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  value: number;

  @CreateDateColumn({ name: "recorded_at" })
  recordedAt: Date;
}
