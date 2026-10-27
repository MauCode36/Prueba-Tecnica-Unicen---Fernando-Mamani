import { DataSource } from "typeorm";
import { StudentEntity } from "../../modules/students/student.entity";
import { UserEntity } from "../../modules/users/user.entity";

const BASE_STUDENTS: ReadonlyArray<{
  email: string;
  studentCode: string;
  program: string;
}> = [
  {
    email: "estudiante@unicen.edu.bo",
    studentCode: "S-2026001",
    program: "Ingeniería de Sistemas",
  },
  {
    email: "estudiante2@unicen.edu.bo",
    studentCode: "S-2026002",
    program: "Ingeniería de Sistemas",
  },
  {
    email: "estudiante3@unicen.edu.bo",
    studentCode: "S-2026003",
    program: "Ingeniería Comercial",
  },
];

/**
 * Creates the demo student profiles, skipping users that already have one (idempotent).
 * @param dataSource - Initialized data source.
 */
export async function seedStudents(dataSource: DataSource): Promise<void> {
  const users = dataSource.getRepository(UserEntity);
  const students = dataSource.getRepository(StudentEntity);
  for (const data of BASE_STUDENTS) {
    const user = await users.findOneBy({ email: data.email });
    if (!user || (await students.existsBy({ userId: user.id }))) continue;
    await students.save(
      students.create({
        userId: user.id,
        studentCode: data.studentCode,
        program: data.program,
      }),
    );
  }
}
