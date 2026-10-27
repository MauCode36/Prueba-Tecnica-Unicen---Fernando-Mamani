import { Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Subject ORM entity representing academic subjects.
 */
@Entity("subjects")
export class SubjectEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}
