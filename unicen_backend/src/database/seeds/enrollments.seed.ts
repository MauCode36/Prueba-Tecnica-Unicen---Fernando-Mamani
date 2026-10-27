import { DataSource } from "typeorm";
import { CourseEntity } from "../../modules/courses/course.entity";
import { EnrollmentOrmEntity } from "../../modules/enrollments/infrastructure/enrollment.orm-entity";
import { StudentEntity } from "../../modules/students/student.entity";
import { SubjectEntity } from "../../modules/subjects/subject.entity";
import { UserEntity } from "../../modules/users/user.entity";

const BASE_ENROLLMENTS: ReadonlyArray<{
  studentEmail: string;
  subjectCode: string;
  term: string;
  section: string;
}> = [
  { studentEmail: "estudiante@unicen.edu.bo", subjectCode: "MAT-101", term: "2026-2", section: "A" },
  { studentEmail: "estudiante@unicen.edu.bo", subjectCode: "BDD-201", term: "2026-2", section: "A" },
  { studentEmail: "estudiante@unicen.edu.bo", subjectCode: "FIS-101", term: "2026-1", section: "A" },
  // PRG-101 A has capacity 2: this leaves exactly one free seat for the concurrency demo.
  { studentEmail: "estudiante2@unicen.edu.bo", subjectCode: "PRG-101", term: "2026-2", section: "A" },
];

/**
 * Inserts the demo enrollments, skipping existing (student, course) pairs (idempotent).
 * @param dataSource - Initialized data source.
 */
export async function seedEnrollments(dataSource: DataSource): Promise<void> {
  const users = dataSource.getRepository(UserEntity);
  const students = dataSource.getRepository(StudentEntity);
  const subjects = dataSource.getRepository(SubjectEntity);
  const courses = dataSource.getRepository(CourseEntity);
  const enrollments = dataSource.getRepository(EnrollmentOrmEntity);
  for (const data of BASE_ENROLLMENTS) {
    const user = await users.findOneBy({ email: data.studentEmail });
    const student = user && (await students.findOneBy({ userId: user.id }));
    const subject = await subjects.findOneBy({ code: data.subjectCode });
    const course =
      subject &&
      (await courses.findOneBy({
        subjectId: subject.id,
        term: data.term,
        section: data.section,
      }));
    if (!student || !course) continue;
    const key = { studentId: student.id, courseId: course.id };
    if (await enrollments.existsBy(key)) continue;
    await enrollments.save(enrollments.create(key));
  }
}
