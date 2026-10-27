import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataState } from '@/shared/components/DataState'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { Button } from '@/shared/components/ui/button'
import { Role } from '@/shared/types'
import { CourseFormDialog } from '../components/CourseFormDialog'
import { CourseManagementTable } from '../components/CourseManagementTable'
import { CourseOfferTable } from '../components/CourseOfferTable'
import { TermSelect } from '@/shared/components/TermSelect'
import { useCourses } from '../hooks/useCourses'
import { useDeleteCourse } from '../hooks/useDeleteCourse'
import { useTermFilter } from '@/shared/hooks/useTermFilter'
import type { Course } from '../types'

/**
 * Course offering by term. ADMIN manages it (HU-06); STUDENT and TEACHER
 * read it with seat availability (HU-07).
 */
export function CoursesPage() {
  const { user } = useAuth()
  const canManage = user?.role === Role.ADMIN
  const { term, setTerm } = useTermFilter()
  const { data, isLoading, isError, refetch } = useCourses(term)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Course | undefined>()
  const [deleting, setDeleting] = useState<Course | undefined>()
  const deleteCourse = useDeleteCourse(() => setDeleting(undefined))

  const handleCreate = () => {
    setEditing(undefined)
    setIsFormOpen(true)
  }
  const handleEdit = (course: Course) => {
    setEditing(course)
    setIsFormOpen(true)
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Oferta de cursos</h1>
        <div className="flex items-center gap-3">
          <TermSelect value={term} onChange={setTerm} />
          {canManage && (
            <Button onClick={handleCreate}>
              <Plus aria-hidden="true" />
              Nuevo curso
            </Button>
          )}
        </div>
      </header>

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.length}
        emptyMessage={`No hay cursos ofertados en la gestión ${term}`}
        loadingFallback={<TableSkeleton columns={canManage ? 6 : 7} />}
        onRetry={() => void refetch()}
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          {canManage ? (
            <CourseManagementTable courses={data ?? []} onEdit={handleEdit} onDelete={setDeleting} />
          ) : (
            <CourseOfferTable courses={data ?? []} />
          )}
        </div>
      </DataState>

      {canManage && (
        <>
          <CourseFormDialog
            isOpen={isFormOpen}
            course={editing}
            defaultTerm={term}
            onClose={() => setIsFormOpen(false)}
          />
          <ConfirmDialog
            isOpen={!!deleting}
            title="Eliminar curso"
            description={`Se eliminará ${deleting?.subject.code ?? ''} paralelo ${deleting?.section ?? ''} de la gestión ${deleting?.term ?? ''}. Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            isPending={deleteCourse.isPending}
            onConfirm={() => deleting && deleteCourse.mutate(deleting.id)}
            onClose={() => setDeleting(undefined)}
          />
        </>
      )}
    </section>
  )
}
