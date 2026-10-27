import { DataSource } from "typeorm";
import { StudentEntity } from "../../modules/students/student.entity";
import { UserEntity } from "../../modules/users/user.entity";

/**
 * Creates the demo student profile, skipping it if the user already has one (idempotent).
 * @param dataSource - Initialized data source.
 */
export async function seedStudents(dataSource: DataSource): Promise<void> {
  const user = await dataSource
    .getRepository(UserEntity)
    .findOneBy({ email: "estudiante@unicen.edu.bo" });
  if (!user) return;
  const repository = dataSource.getRepository(StudentEntity);
  if (await repository.existsBy({ userId: user.id })) return;
  await repository.save(
    repository.create({
      userId: user.id,
      studentCode: "S-2026001",
      program: "Ingeniería de Sistemas",
    }),
  );
}
