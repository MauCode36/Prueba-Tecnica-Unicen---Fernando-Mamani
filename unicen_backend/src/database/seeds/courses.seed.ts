import { DataSource } from "typeorm";
import { CourseEntity } from "../../modules/courses/course.entity";
import { SubjectEntity } from "../../modules/subjects/subject.entity";
import { UserEntity } from "../../modules/users/user.entity";

const TEACHER_1 = "docente@unicen.edu.bo";
const TEACHER_2 = "docente2@unicen.edu.bo";

const BASE_COURSES: ReadonlyArray<{
  subjectCode: string;
  term: string;
  section: string;
  maxCapacity: number;
  teacherEmail: string;
}> = [
  { subjectCode: "MAT-101", term: "2026-2", section: "A", maxCapacity: 30, teacherEmail: TEACHER_1 },
  { subjectCode: "MAT-101", term: "2026-2", section: "B", maxCapacity: 25, teacherEmail: TEACHER_2 },
  // Capacity 2 on purpose: demo of a full course in E3.
  { subjectCode: "PRG-101", term: "2026-2", section: "A", maxCapacity: 2, teacherEmail: TEACHER_1 },
  { subjectCode: "BDD-201", term: "2026-2", section: "A", maxCapacity: 20, teacherEmail: TEACHER_1 },
  { subjectCode: "SIS-301", term: "2026-2", section: "A", maxCapacity: 15, teacherEmail: TEACHER_2 },
  { subjectCode: "FIS-101", term: "2026-1", section: "A", maxCapacity: 30, teacherEmail: TEACHER_1 },
];

/**
 * Inserts the base courses, skipping existing (subject, term, section) (idempotent).
 * @param dataSource - Initialized data source.
 */
export async function seedCourses(dataSource: DataSource): Promise<void> {
  const subjects = dataSource.getRepository(SubjectEntity);
  const users = dataSource.getRepository(UserEntity);
  const courses = dataSource.getRepository(CourseEntity);
  for (const data of BASE_COURSES) {
    const subject = await subjects.findOneBy({ code: data.subjectCode });
    const teacher = await users.findOneBy({ email: data.teacherEmail });
    if (!subject || !teacher) continue;
    const key = { subjectId: subject.id, term: data.term, section: data.section };
    if (await courses.existsBy(key)) continue;
    await courses.save(
      courses.create({
        ...key,
        teacherId: teacher.id,
        maxCapacity: data.maxCapacity,
      }),
    );
  }
}
