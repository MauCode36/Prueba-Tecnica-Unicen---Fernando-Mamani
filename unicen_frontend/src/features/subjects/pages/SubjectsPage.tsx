import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataState } from '@/shared/components/DataState'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { Button } from '@/shared/components/ui/button'
import { Role } from '@/shared/types'
import { SubjectFormDialog } from '../components/SubjectFormDialog'
import { SubjectTable } from '../components/SubjectTable'
import { useDeleteSubject } from '../hooks/useDeleteSubject'
import { useSubjects } from '../hooks/useSubjects'
import type { Subject } from '../types'

/**
 * Subject catalog (HU-05). Everyone can read it; only ADMIN manages it.
 */
export function SubjectsPage() {
  const { user } = useAuth()
  const canManage = user?.role === Role.ADMIN
  const { data, isLoading, isError, refetch } = useSubjects()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | undefined>()
  const [deleting, setDeleting] = useState<Subject | undefined>()
  const deleteSubject = useDeleteSubject(() => setDeleting(undefined))

  const handleCreate = () => {
    setEditing(undefined)
    setIsFormOpen(true)
  }
  const handleEdit = (subject: Subject) => {
    setEditing(subject)
    setIsFormOpen(true)
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Materias</h1>
        {canManage && (
          <Button onClick={handleCreate}>
            <Plus aria-hidden="true" />
            Nueva materia
          </Button>
        )}
      </header>

      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.length}
        emptyMessage="Aún no hay materias registradas"
        loadingFallback={<TableSkeleton columns={canManage ? 4 : 3} />}
        onRetry={() => void refetch()}
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <SubjectTable
            subjects={data ?? []}
            canManage={canManage}
            onEdit={handleEdit}
            onDelete={setDeleting}
          />
        </div>
      </DataState>

      {canManage && (
        <>
          <SubjectFormDialog
            isOpen={isFormOpen}
            subject={editing}
            onClose={() => setIsFormOpen(false)}
          />
          <ConfirmDialog
            isOpen={!!deleting}
            title="Eliminar materia"
            description={`Se eliminará ${deleting?.code ?? ''} · ${deleting?.name ?? ''}. Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            isPending={deleteSubject.isPending}
            onConfirm={() => deleting && deleteSubject.mutate(deleting.id)}
            onClose={() => setDeleting(undefined)}
          />
        </>
      )}
    </section>
  )
}
