import { DataState } from '@/shared/components/DataState'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { TeacherCourseCard } from '../components/TeacherCourseCard'
import { useMyCourses } from '../hooks/useMyCourses'

/**
 * Courses assigned to the authenticated teacher (HU-08).
 */
export function MyCoursesPage() {
  const { data, isLoading, isError, refetch } = useMyCourses()

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold tracking-tight text-ink">Mis cursos</h1>
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.length}
        emptyMessage="No tienes cursos asignados"
        loadingFallback={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
        }
        onRetry={() => void refetch()}
      >
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.map((course) => (
            <li key={course.id}>
              <TeacherCourseCard course={course} />
            </li>
          ))}
        </ul>
      </DataState>
    </section>
  )
}
