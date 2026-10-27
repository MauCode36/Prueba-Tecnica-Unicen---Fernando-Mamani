import { Link } from 'react-router'
import { DataState } from '@/shared/components/DataState'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { TermSelect } from '@/shared/components/TermSelect'
import { useTermFilter } from '@/shared/hooks/useTermFilter'
import { EnrollmentsSummary } from '../components/EnrollmentsSummary'
import { MyEnrollmentsTable } from '../components/MyEnrollmentsTable'
import { useMyEnrollments } from '../hooks/useMyEnrollments'

/**
 * Active enrollments of the authenticated student by term (HU-12), with
 * the option to cancel each one (HU-13).
 */
export function MyEnrollmentsPage() {
  const { term, setTerm } = useTermFilter()
  const { data, isLoading, isError, refetch } = useMyEnrollments(term)

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Mis inscripciones</h1>
        <TermSelect value={term} onChange={setTerm} />
      </header>

      {data && data.length > 0 && <EnrollmentsSummary enrollments={data} />}

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.length}
        emptyMessage={`No tienes inscripciones en la gestión ${term}`}
        emptyAction={
          <Link to={`/courses?term=${term}`} className="text-sm font-medium text-ink underline">
            Ver oferta de cursos
          </Link>
        }
        loadingFallback={<TableSkeleton columns={6} />}
        onRetry={() => void refetch()}
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <MyEnrollmentsTable enrollments={data ?? []} />
        </div>
      </DataState>
    </section>
  )
}
