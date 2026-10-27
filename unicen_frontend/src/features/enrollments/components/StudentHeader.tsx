import { StudentStatusBadge, type Student } from '@/features/students'

interface StudentHeaderProps {
  /** Student whose enrollments are shown. */
  student: Student
}

/**
 * Title block of a student's enrollments page: name, code, program and status.
 */
export function StudentHeader({ student }: StudentHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-ink">{student.name}</h1>
        <StudentStatusBadge isActive={student.isActive} />
      </div>
      <p className="text-ink-muted">
        {student.studentCode} · {student.program}
      </p>
    </div>
  )
}
