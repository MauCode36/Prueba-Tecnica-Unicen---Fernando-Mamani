import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Subject ORM entity representing academic subjects.
 */
@Entity("subjects")
export class SubjectEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 20, unique: true })
  code: string;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "smallint" })
  credits: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
