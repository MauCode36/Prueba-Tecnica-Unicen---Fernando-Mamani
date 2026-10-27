import { Link } from 'react-router'

interface CoursePageMessageProps {
  /** Spanish title of the message. */
  title: string
  /** Spanish explanation. */
  description: string
}

/**
 * Full-page message for course errors (403, 404) with a link back to "Mis cursos".
 */
export function CoursePageMessage({ title, description }: CoursePageMessageProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-2 rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="text-ink-muted">{description}</p>
      <Link to="/courses/mine" className="text-sm font-medium text-ink underline">
        Ir a Mis cursos
      </Link>
    </div>
  )
}
