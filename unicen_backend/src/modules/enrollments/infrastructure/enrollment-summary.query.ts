import { DataSource } from "typeorm";
import {
  EnrollmentFilters,
  EnrollmentSummary,
} from "../domain/enrollment-summary";
import { EnrollmentStatus } from "../domain/enrollment-status.enum";

interface SummaryRow {
  id: string;
  status: EnrollmentStatus;
  enrolled_at: Date;
  student_id: string;
  student_code: string;
  student_name: string;
  course_id: string;
  term: string;
  section: string;
  subject_code: string;
  subject_name: string;
  subject_credits: number;
  teacher_name: string;
}

const SELECT_SUMMARIES = `
  SELECT e.id, e.status, e.created_at AS enrolled_at,
         st.id AS student_id, st.student_code, su.name AS student_name,
         c.id AS course_id, c.term, c.section,
         s.code AS subject_code, s.name AS subject_name, s.credits AS subject_credits,
         tu.name AS teacher_name
  FROM enrollments e
  JOIN students st ON st.id = e.student_id
  JOIN users su ON su.id = st.user_id
  JOIN courses c ON c.id = e.course_id
  JOIN subjects s ON s.id = c.subject_id
  JOIN users tu ON tu.id = c.teacher_id`;

/**
 * Read projection of enrollments with student and course details in one query.
 * @param dataSource - Data source used to run the query.
 * @param filters - Optional student, course, term and status filters.
 * @returns The summaries ordered by term (newest first) and subject code.
 */
export async function queryEnrollmentSummaries(
  dataSource: DataSource,
  filters: EnrollmentFilters,
): Promise<EnrollmentSummary[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const addFilter = (sql: string, value: unknown) => {
    if (value === undefined) return;
    params.push(value);
    conditions.push(sql.replace("?", `$${params.length}`));
  };
  addFilter("e.student_id = ?", filters.studentId);
  addFilter("e.course_id = ?", filters.courseId);
  addFilter("c.term = ?", filters.term);
  addFilter("e.status = ?", filters.status);
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const rows: SummaryRow[] = await dataSource.query(
    `${SELECT_SUMMARIES}${where} ORDER BY c.term DESC, s.code ASC, c.section ASC`,
    params,
  );
  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    enrolledAt: row.enrolled_at,
    student: {
      id: row.student_id,
      studentCode: row.student_code,
      name: row.student_name,
    },
    course: {
      id: row.course_id,
      term: row.term,
      section: row.section,
      subject: {
        code: row.subject_code,
        name: row.subject_name,
        credits: row.subject_credits,
      },
      teacher: { name: row.teacher_name },
    },
  }));
}
