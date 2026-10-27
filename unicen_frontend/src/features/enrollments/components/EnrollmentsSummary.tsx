import type { EnrollmentSummary } from '../types'
import { sumCredits } from '../utils/enrollment.utils'

interface EnrollmentsSummaryProps {
  /** Active enrollments of the term. */
  enrollments: EnrollmentSummary[]
}

/**
 * One-line load summary: "3 materias · 13 créditos".
 */
export function EnrollmentsSummary({ enrollments }: EnrollmentsSummaryProps) {
  const count = enrollments.length
  return (
    <p className="text-ink-muted">
      {count} {count === 1 ? 'materia' : 'materias'} · {sumCredits(enrollments)} créditos
    </p>
  )
}
