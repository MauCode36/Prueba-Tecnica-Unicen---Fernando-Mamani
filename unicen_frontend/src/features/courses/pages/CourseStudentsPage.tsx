import { useParams } from 'react-router'
import { DataState } from '@/shared/components/DataState'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { getHttpStatus } from '@/shared/lib/http-status.utils'
import { CoursePageMessage } from '../components/CoursePageMessage'
import { EnrolledStudentsTable } from '../components/EnrolledStudentsTable'
import { useCourse } from '../hooks/useCourse'
import { useEnrolledStudents } from '../hooks/useEnrolledStudents'

/**
 * Students enrolled in a course (HU-08). The course teacher and ADMIN can
 * open it; any other teacher gets a 403 that is shown here, not as a redirect.
 */
export function CourseStudentsPage() {
  const { courseId = '' } = useParams()
  const course = useCourse(courseId)
  const students = useEnrolledStudents(courseId)
  const status = getHttpStatus(students.error)

  const title = course.data
    ? `${course.data.subject.code} · ${course.data.subject.name} — Paralelo ${course.data.section}`
    : 'Inscritos'

  if (status === 403) {
    return (
      <CoursePageMessage
        title="Acceso denegado"
        description="Solo el docente del curso o un administrador pueden ver a sus inscritos."
      />
    )
  }
  if (status === 400 || status === 404) {
    return (
      <CoursePageMessage title="Curso no encontrado" description="El curso que buscas no existe." />
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold tracking-tight text-ink">{title}</h1>
      <DataState
        isLoading={students.isLoading}
        isError={students.isError}
        isEmpty={!students.data?.length}
        emptyMessage="Aún no hay estudiantes inscritos"
        loadingFallback={<TableSkeleton columns={5} />}
        onRetry={() => void students.refetch()}
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <EnrolledStudentsTable students={students.data ?? []} />
        </div>
      </DataState>
    </section>
  )
}
