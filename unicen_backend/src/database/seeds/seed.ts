import { AppDataSource } from "../../config/data-source";
import { seedCourses } from "./courses.seed";
import { seedEnrollments } from "./enrollments.seed";
import { seedStudents } from "./students.seed";
import { seedSubjects } from "./subjects.seed";
import { seedUsers } from "./users.seed";

/**
 * Runs all seeds in dependency order (each one is idempotent).
 */
async function runSeed(): Promise<void> {
  await AppDataSource.initialize();
  await seedUsers(AppDataSource);
  await seedStudents(AppDataSource);
  await seedSubjects(AppDataSource);
  await seedCourses(AppDataSource);
  await seedEnrollments(AppDataSource);
  await AppDataSource.destroy();
}

runSeed().catch((err) => {
  console.error("Error running seed:", err);
  process.exit(1);
});
