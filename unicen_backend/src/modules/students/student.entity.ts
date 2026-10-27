import { Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Student ORM entity representing student records.
 */
@Entity("students")
export class StudentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}
