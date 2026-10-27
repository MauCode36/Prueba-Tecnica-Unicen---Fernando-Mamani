import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { Role } from "../../shared/enums/role.enum";
import { UserEntity } from "../../modules/users/user.entity";

const BASE_USERS: ReadonlyArray<{
  name: string;
  email: string;
  password: string;
  role: Role;
}> = [
  {
    name: "Administrador UNICEN",
    email: "admin@unicen.edu.bo",
    password: "Admin123!",
    role: Role.ADMIN,
  },
  {
    name: "Dr. Carlos Mendoza",
    email: "docente@unicen.edu.bo",
    password: "Teacher123!",
    role: Role.TEACHER,
  },
  {
    name: "Lic. María Rojas",
    email: "docente2@unicen.edu.bo",
    password: "Teacher123!",
    role: Role.TEACHER,
  },
  {
    name: "Ana Sofía Vargas",
    email: "estudiante@unicen.edu.bo",
    password: "Student123!",
    role: Role.STUDENT,
  },
  {
    name: "Luis Fernando Quispe",
    email: "estudiante2@unicen.edu.bo",
    password: "Student123!",
    role: Role.STUDENT,
  },
  {
    name: "Camila Torrez",
    email: "estudiante3@unicen.edu.bo",
    password: "Student123!",
    role: Role.STUDENT,
  },
];

/**
 * Inserts the base users, skipping those whose email already exists (idempotent).
 * @param dataSource - Initialized data source.
 */
export async function seedUsers(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(UserEntity);
  for (const data of BASE_USERS) {
    if (await repository.existsBy({ email: data.email })) {
      continue;
    }
    await repository.save(
      repository.create({
        name: data.name,
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, 10),
        role: data.role,
      }),
    );
  }
}
