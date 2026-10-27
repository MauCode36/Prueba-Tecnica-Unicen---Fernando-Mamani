import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useStudent } from '@/features/students'
import { DataState } from '@/shared/components/DataState'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { TermSelect } from '@/shared/components/TermSelect'
import { Button } from '@/shared/components/ui/button'
import { useTermFilter } from '@/shared/hooks/useTermFilter'
import { getHttpStatus } from '@/shared/lib/http-status.utils'
import { AdminEnrollDialog } from '../components/AdminEnrollDialog'
import { StudentEnrollmentsTable } from '../components/StudentEnrollmentsTable'
import { StudentHeader } from '../components/StudentHeader'
import { useStudentEnrollments } from '../hooks/useStudentEnrollments'

/**
 * Enrollments of one student for the ADMIN: enroll them in a course (HU-11)
 * and cancel active enrollments (HU-13).
 */
export function StudentEnrollmentsPage() {
  const { studentId = '' } = useParams()
  const { term, setTerm } = useTermFilter()
  const student = useStudent(studentId)
  const enrollments = useStudentEnrollments(studentId, term)
  const [isEnrollOpen, setIsEnrollOpen] = useState(false)
  const studentStatus = getHttpStatus(student.error)

  if (studentStatus === 400 || studentStatus === 404) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-ink">Estudiante no encontrado</h2>
        <p className="text-ink-muted">El estudiante que buscas no existe.</p>
        <Link to="/students" className="text-sm font-medium text-ink underline">
          Ir a Estudiantes
        </Link>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      {student.data && <StudentHeader student={student.data} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TermSelect value={term} onChange={setTerm} />
        {student.data?.isActive ? (
          <Button onClick={() => setIsEnrollOpen(true)}>
            <Plus aria-hidden="true" />
            Inscribir en curso
          </Button>
        ) : (
          student.data && <p className="text-sm text-ink-muted">Estudiante inactivo: no se puede inscribir.</p>
        )}
      </div>

      <DataState
        isLoading={enrollments.isLoading}
        isError={enrollments.isError}
        isEmpty={!enrollments.data?.length}
        emptyMessage={`Sin inscripciones en la gestión ${term}`}
        loadingFallback={<TableSkeleton columns={6} />}
        onRetry={() => void enrollments.refetch()}
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <StudentEnrollmentsTable enrollments={enrollments.data ?? []} />
        </div>
      </DataState>

      <AdminEnrollDialog
        isOpen={isEnrollOpen}
        studentId={studentId}
        term={term}
        onClose={() => setIsEnrollOpen(false)}
      />
    </section>
  )
}
