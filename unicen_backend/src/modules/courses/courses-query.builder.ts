import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository, SelectQueryBuilder } from "typeorm";
import {
  CourseFilters,
  CourseView,
  EnrolledStudentView,
} from "./course-view.type";
import { CourseEntity } from "./course.entity";

interface CourseRow {
  id: string;
  term: string;
  section: string;
  max_capacity: number;
  enrolled_count: number;
  is_enrolled: boolean;
  subject_id: string;
  subject_code: string;
  subject_name: string;
  subject_credits: number;
  teacher_id: string;
  teacher_name: string;
}

interface EnrolledStudentRow {
  enrollment_id: string;
  student_id: string;
  student_code: string;
  name: string;
  email: string;
  program: string;
  enrolled_at: Date;
}

const ENROLLED_COUNT_SQL = `(SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'ACTIVE')::int`;
const IS_ENROLLED_SQL = `EXISTS (
  SELECT 1 FROM enrollments e
  JOIN students st ON st.id = e.student_id
  WHERE e.course_id = c.id AND st.user_id = :viewerUserId AND e.status = 'ACTIVE'
)`;

/**
 * Read-side projection of courses with seat counts computed in a single query.
 * Enrollment writes remain owned by the enrollments module.
 */
@Injectable()
export class CoursesQueryBuilder {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  /**
   * Lists courses with seat counts, ordered by subject code and section.
   * @param filters - Optional term, subject and teacher filters.
   * @param viewerUserId - User id whose enrollment status fills `isEnrolled`.
   * @returns The course views.
   */
  async findMany(
    filters: CourseFilters,
    viewerUserId?: string,
  ): Promise<CourseView[]> {
    const qb = this.baseQuery(viewerUserId);
    if (filters.term) qb.andWhere("c.term = :term", { term: filters.term });
    if (filters.subjectId) {
      qb.andWhere("c.subject_id = :subjectId", { subjectId: filters.subjectId });
    }
    if (filters.teacherId) {
      qb.andWhere("c.teacher_id = :teacherId", { teacherId: filters.teacherId });
    }
    const rows = await qb
      .orderBy("s.code", "ASC")
      .addOrderBy("c.section", "ASC")
      .getRawMany<CourseRow>();
    return rows.map((row) => this.toView(row));
  }

  /**
   * Finds a single course projection.
   * @param id - Course UUID.
   * @param viewerUserId - User id whose enrollment status fills `isEnrolled`.
   * @returns The course view or null.
   */
  async findOneView(
    id: string,
    viewerUserId?: string,
  ): Promise<CourseView | null> {
    const row = await this.baseQuery(viewerUserId)
      .andWhere("c.id = :id", { id })
      .getRawOne<CourseRow>();
    return row ? this.toView(row) : null;
  }

  /**
   * Counts the active enrollments of a course.
   * @param courseId - Course UUID.
   * @param manager - Optional transactional entity manager.
   * @returns The number of active enrollments.
   */
  async countActiveEnrollments(
    courseId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const runner = manager ?? this.courseRepository.manager;
    const rows: { count: number }[] = await runner.query(
      `SELECT COUNT(*)::int AS count FROM enrollments WHERE course_id = $1 AND status = 'ACTIVE'`,
      [courseId],
    );
    return rows[0]?.count ?? 0;
  }

  /**
   * Lists the students with an active enrollment in a course, by name.
   * @param courseId - Course UUID.
   * @returns The enrolled students.
   */
  async findEnrolledStudents(courseId: string): Promise<EnrolledStudentView[]> {
    const rows: EnrolledStudentRow[] = await this.courseRepository.manager.query(
      `SELECT e.id AS enrollment_id, st.id AS student_id, st.student_code,
              u.name, u.email, st.program, e.created_at AS enrolled_at
       FROM enrollments e
       JOIN students st ON st.id = e.student_id
       JOIN users u ON u.id = st.user_id
       WHERE e.course_id = $1 AND e.status = 'ACTIVE'
       ORDER BY u.name ASC`,
      [courseId],
    );
    return rows.map((row) => ({
      enrollmentId: row.enrollment_id,
      studentId: row.student_id,
      studentCode: row.student_code,
      name: row.name,
      email: row.email,
      program: row.program,
      enrolledAt: row.enrolled_at,
    }));
  }

  private baseQuery(viewerUserId?: string): SelectQueryBuilder<CourseEntity> {
    const qb = this.courseRepository
      .createQueryBuilder("c")
      .innerJoin("c.subject", "s")
      .innerJoin("c.teacher", "t")
      .select("c.id", "id")
      .addSelect("c.term", "term")
      .addSelect("c.section", "section")
      .addSelect("c.max_capacity", "max_capacity")
      .addSelect("s.id", "subject_id")
      .addSelect("s.code", "subject_code")
      .addSelect("s.name", "subject_name")
      .addSelect("s.credits", "subject_credits")
      .addSelect("t.id", "teacher_id")
      .addSelect("t.name", "teacher_name")
      .addSelect(ENROLLED_COUNT_SQL, "enrolled_count");
    if (viewerUserId) {
      qb.addSelect(IS_ENROLLED_SQL, "is_enrolled").setParameter(
        "viewerUserId",
        viewerUserId,
      );
    } else {
      qb.addSelect("FALSE", "is_enrolled");
    }
    return qb;
  }

  private toView(row: CourseRow): CourseView {
    return {
      id: row.id,
      term: row.term,
      section: row.section,
      maxCapacity: row.max_capacity,
      enrolledCount: row.enrolled_count,
      isEnrolled: row.is_enrolled,
      subject: {
        id: row.subject_id,
        code: row.subject_code,
        name: row.subject_name,
        credits: row.subject_credits,
      },
      teacher: { id: row.teacher_id, name: row.teacher_name },
    };
  }
}
