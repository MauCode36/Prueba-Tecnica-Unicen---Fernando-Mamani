import { Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Course ORM entity representing a course offering.
 */
@Entity("courses")
export class CourseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}
