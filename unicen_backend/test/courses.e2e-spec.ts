import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { App } from "supertest/types";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { DomainExceptionFilter } from "../src/shared/filters/domain-exception.filter";

/**
 * E2E for E2 (subjects and courses). Requires a migrated and seeded database.
 */
describe("Subjects and courses (e2e)", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const codes = `E2E-${Date.now()}`;
  const tokens: Record<string, string> = {};
  const users: Record<string, string> = {};

  const credentials = {
    admin: ["admin@unicen.edu.bo", "Admin123!"],
    teacher1: ["docente@unicen.edu.bo", "Teacher123!"],
    teacher2: ["docente2@unicen.edu.bo", "Teacher123!"],
    student: ["estudiante@unicen.edu.bo", "Student123!"],
  } as const;

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
      users[key] = ((
        await request(server())
          .get("/api/auth/me")
          .set("Authorization", `Bearer ${tokens[key]}`)
      ).body as { id: string }).id;
    }
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM courses WHERE subject_id IN (SELECT id FROM subjects WHERE code LIKE $1)`,
      [`${codes}%`],
    );
    await dataSource.query(`DELETE FROM subjects WHERE code LIKE $1`, [
      `${codes}%`,
    ]);
    await app.close();
  });

  const server = (): App => app.getHttpServer() as App;
  const auth = (key: string) => ({ Authorization: `Bearer ${tokens[key]}` });

  it("ADMIN creates a subject (201) and the same code is rejected (409)", async () => {
    const body = { code: codes, name: "E2E Subject", credits: 3 };

    await request(server())
      .post("/api/subjects")
      .set(auth("admin"))
      .send(body)
      .expect(201);
    await request(server())
      .post("/api/subjects")
      .set(auth("admin"))
      .send(body)
      .expect(409);
  });

  it("STUDENT cannot create a subject (403)", async () => {
    await request(server())
      .post("/api/subjects")
      .set(auth("student"))
      .send({ code: `${codes}-S`, name: "X", credits: 3 })
      .expect(403);
  });

  it("ADMIN creates a course with a valid teacher (201) and rejects a STUDENT teacher (400)", async () => {
    const subjects = await request(server())
      .get("/api/subjects")
      .set(auth("admin"));
    const subject = (subjects.body as { id: string; code: string }[]).find(
      (s) => s.code === codes,
    );
    const course = {
      subjectId: subject?.id,
      term: "2030-1",
      section: "a",
      maxCapacity: 10,
    };

    await request(server())
      .post("/api/courses")
      .set(auth("admin"))
      .send({ ...course, teacherId: users.teacher1 })
      .expect(201);
    await request(server())
      .post("/api/courses")
      .set(auth("admin"))
      .send({ ...course, section: "b", teacherId: users.student })
      .expect(400);
  });

  it("STUDENT lists the offering with availableSeats and isEnrolled", async () => {
    const res = await request(server())
      .get("/api/courses?term=2026-2")
      .set(auth("student"))
      .expect(200);

    const courses = res.body as {
      availableSeats: number;
      isEnrolled: boolean;
      subject: { code: string };
    }[];
    expect(courses[0]).toHaveProperty("availableSeats");
    // The seed enrolls this student in BDD-201 A but not in SIS-301 A.
    expect(courses.find((c) => c.subject.code === "BDD-201")?.isEnrolled).toBe(
      true,
    );
    expect(courses.find((c) => c.subject.code === "SIS-301")?.isEnrolled).toBe(
      false,
    );
  });

  it("another teacher cannot list the enrolled students of a course (403)", async () => {
    const list = await request(server())
      .get("/api/courses/mine")
      .set(auth("teacher1"))
      .expect(200);
    const courseId = (list.body as { id: string }[])[0].id;

    await request(server())
      .get(`/api/courses/${courseId}/enrolled-students`)
      .set(auth("teacher2"))
      .expect(403);
  });
});
