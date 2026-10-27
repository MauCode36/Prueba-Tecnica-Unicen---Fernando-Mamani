import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataState } from '@/shared/components/DataState'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { Button } from '@/shared/components/ui/button'
import { StudentFilters } from '../components/StudentFilters'
import { StudentFormDialog } from '../components/StudentFormDialog'
import { StudentTable } from '../components/StudentTable'
import { useStudentFilters } from '../hooks/useStudentFilters'
import { useStudents } from '../hooks/useStudents'
import { useUpdateStudentStatus } from '../hooks/useUpdateStudentStatus'
import type { Student } from '../types'

/**
 * Students management (HU-09, ADMIN). Deactivating asks for confirmation;
 * activating does not.
 */
export function StudentsPage() {
  const { searchInput, setSearchInput, status, setStatus, filters } = useStudentFilters()
  const { data, isLoading, isError, refetch } = useStudents(filters)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Student | undefined>()
  const [deactivating, setDeactivating] = useState<Student | undefined>()
  const updateStatus = useUpdateStudentStatus(() => setDeactivating(undefined))

  const handleCreate = () => {
    setEditing(undefined)
    setIsFormOpen(true)
  }
  const handleEdit = (student: Student) => {
    setEditing(student)
    setIsFormOpen(true)
  }
  const handleToggleStatus = (student: Student) => {
    if (student.isActive) setDeactivating(student)
    else updateStatus.mutate({ id: student.id, isActive: true })
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Estudiantes</h1>
        <Button onClick={handleCreate}>
          <Plus aria-hidden="true" />
          Nuevo estudiante
        </Button>
      </header>

      <StudentFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={setStatus}
      />

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.length}
        emptyMessage="No se encontraron estudiantes"
        loadingFallback={<TableSkeleton columns={6} />}
        onRetry={() => void refetch()}
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <StudentTable students={data ?? []} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
        </div>
      </DataState>

      <StudentFormDialog isOpen={isFormOpen} student={editing} onClose={() => setIsFormOpen(false)} />
      <ConfirmDialog
        isOpen={!!deactivating}
        title="Desactivar estudiante"
        description={`${deactivating?.name ?? 'El estudiante'} no podrá iniciar sesión ni inscribirse. Sus inscripciones actuales se mantienen.`}
        confirmLabel="Desactivar"
        isPending={updateStatus.isPending}
        onConfirm={() =>
          deactivating && updateStatus.mutate({ id: deactivating.id, isActive: false })
        }
        onClose={() => setDeactivating(undefined)}
      />
    </section>
  )
}
