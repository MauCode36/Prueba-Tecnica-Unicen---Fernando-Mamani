import { Injectable } from "@nestjs/common";
import { StudentEntity } from "../../students/student.entity";
import { StudentsService } from "../../students/students.service";
import {
  StudentDirectory,
  StudentRef,
} from "../domain/student-directory.port";

/**
 * Adapter implementing the StudentDirectory port with the students module.
 */
@Injectable()
export class StudentDirectoryAdapter implements StudentDirectory {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Finds a student profile by its account id.
   * @param userId - User UUID.
   * @returns The student reference or null.
   */
  async findByUserId(userId: string): Promise<StudentRef | null> {
    return this.toRef(await this.studentsService.findByUserId(userId));
  }

  /**
   * Finds a student profile by its id.
   * @param id - Student UUID.
   * @returns The student reference or null.
   */
  async findById(id: string): Promise<StudentRef | null> {
    return this.toRef(await this.studentsService.findById(id));
  }

  private toRef(student: StudentEntity | null): StudentRef | null {
    return student ? { id: student.id, isActive: student.user.isActive } : null;
  }
}
