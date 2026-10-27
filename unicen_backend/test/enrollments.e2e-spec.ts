import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { DomainExceptionFilter } from "../src/shared/filters/domain-exception.filter";

interface Course {
  id: string;
  term: string;
  section: string;
  availableSeats: number;
  subject: { code: string };
}

/**
 * E2E for E3 (students and enrollments). Requires a migrated and seeded database.
 * Restores the seed state of the enrollments it touches.
 */
describe("Students and enrollments (e2e)", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const tokens: Record<string, string> = {};
  const studentIds: Record<string, string> = {};

  const credentials = {
    admin: ["admin@unicen.edu.bo", "Admin123!"],
    teacher: ["docente@unicen.edu.bo", "Teacher123!"],
    ana: ["estudiante@unicen.edu.bo", "Student123!"],
    luis: ["estudiante2@unicen.edu.bo", "Student123!"],
    camila: ["estudiante3@unicen.edu.bo", "Student123!"],
  } as const;

  const server = (): App => app.getHttpServer() as App;
  const auth = (key: string) => ({ Authorization: `Bearer ${tokens[key]}` });

  const findCourse = async (code: string, term: string, section: string) => {
    const res = await request(server())
      .get(`/api/courses?term=${term}`)
      .set(auth("camila"))
      .expect(200);
    const course = (res.body as Course[]).find(
      (c) => c.subject.code === code && c.section === section,
    );
    if (!course) throw new Error(`Course ${code} ${section} not seeded`);
    return course;
  };

  /** Removes every enrollment the tests may have created for Camila and Ana in PRG-101 A. */
  const restoreSeedState = async () => {
    await dataSource.query(`DELETE FROM enrollments WHERE student_id = $1`, [
      studentIds.camila,
    ]);
    await dataSource.query(
      `DELETE FROM enrollments WHERE student_id = $1 AND course_id IN
         (SELECT c.id FROM courses c JOIN subjects s ON s.id = c.subject_id WHERE s.code = 'PRG-101')`,
      [studentIds.ana],
    );
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
    dataSource = app.get(DataSource);

    for (const [key, [email, password]] of Object.entries(credentials)) {
      const res = await request(server())
        .post("/api/auth/login")
        .send({ email, password });
      tokens[key] = (res.body as { accessToken: string }).accessToken;
    }
    for (const key of ["ana", "luis", "camila"]) {
      const rows: { id: string }[] = await dataSource.query(
        `SELECT st.id FROM students st JOIN users u ON u.id = st.user_id WHERE u.email = $1`,
        [credentials[key as keyof typeof credentials][0]],
      );
      studentIds[key] = rows[0].id;
    }
    await restoreSeedState();
  });

  afterAll(async () => {
    await restoreSeedState();
    await app.close();
  });

  it("STUDENT enrolls in a course with seats (201) and repeating is rejected (409 DUPLICATE_ENROLLMENT)", async () => {
    const course = await findCourse("BDD-201", "2026-2", "A");

    await request(server())
      .post("/api/enrollments")
      .set(auth("camila"))
      .send({ courseId: course.id })
      .expect(201);
    const repeat = await request(server())
      .post("/api/enrollments")
      .set(auth("camila"))
      .send({ courseId: course.id })
      .expect(409);

    expect((repeat.body as { error: string }).error).toBe(
      "DUPLICATE_ENROLLMENT",
    );
  });

  it("STUDENT cancels and the seat is released in GET /api/courses", async () => {
    const course = await findCourse("BDD-201", "2026-2", "A");
    const mine = await request(server())
      .get("/api/enrollments/mine?term=2026-2")
      .set(auth("camila"))
      .expect(200);
    const enrollmentId = (mine.body as { id: string }[])[0].id;

    await request(server())
      .patch(`/api/enrollments/${enrollmentId}/cancel`)
      .set(auth("camila"))
      .expect(200);

    const after = await findCourse("BDD-201", "2026-2", "A");
    expect(after.availableSeats).toBe(course.availableSeats + 1);
  });

  it("concurrent enrollments on the last seat: exactly one 201 and one 409 COURSE_FULL", async () => {
    const course = await findCourse("PRG-101", "2026-2", "A");
    expect(course.availableSeats).toBe(1);

    const [ana, camila] = await Promise.all([
      request(server())
        .post("/api/enrollments")
        .set(auth("ana"))
        .send({ courseId: course.id }),
      request(server())
        .post("/api/enrollments")
        .set(auth("camila"))
        .send({ courseId: course.id }),
    ]);

    const statuses = [ana.status, camila.status].sort();
    expect(statuses).toEqual([201, 409]);
    const rejected = ana.status === 409 ? ana : camila;
    expect((rejected.body as { error: string }).error).toBe("COURSE_FULL");
    const after = await findCourse("PRG-101", "2026-2", "A");
    expect(after.availableSeats).toBe(0);
  });

  it("STUDENT cannot cancel another student's enrollment (403)", async () => {
    const anaEnrollments = await request(server())
      .get("/api/enrollments/mine")
      .set(auth("ana"))
      .expect(200);
    const enrollmentId = (anaEnrollments.body as { id: string }[])[0].id;

    await request(server())
      .patch(`/api/enrollments/${enrollmentId}/cancel`)
      .set(auth("luis"))
      .expect(403);
  });

  it("ADMIN enrolls a student (201) and without studentId gets 400", async () => {
    const course = await findCourse("MAT-101", "2026-2", "B");

    await request(server())
      .post("/api/enrollments")
      .set(auth("admin"))
      .send({ courseId: course.id, studentId: studentIds.camila })
      .expect(201);
    await request(server())
      .post("/api/enrollments")
      .set(auth("admin"))
      .send({ courseId: course.id })
      .expect(400);
  });

  it("ADMIN gets 409 for a repeated student code and POST /api/users rejects role STUDENT (400)", async () => {
    await request(server())
      .post("/api/students")
      .set(auth("admin"))
      .send({
        name: "Repetido",
        email: `repetido-${Date.now()}@unicen.edu.bo`,
        password: "Student123!",
        studentCode: "s-2026001",
        program: "Sistemas",
      })
      .expect(409);
    await request(server())
      .post("/api/users")
      .set(auth("admin"))
      .send({
        name: "Sin perfil",
        email: `sinperfil-${Date.now()}@unicen.edu.bo`,
        password: "Student123!",
        role: "STUDENT",
      })
      .expect(400);
  });

  it("TEACHER cannot enroll (403)", async () => {
    const course = await findCourse("MAT-101", "2026-2", "A");

    await request(server())
      .post("/api/enrollments")
      .set(auth("teacher"))
      .send({ courseId: course.id })
      .expect(403);
  });
});
