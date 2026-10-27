import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { Subject } from '../types'
import { SubjectRowActions } from './SubjectRowActions'

interface SubjectTableProps {
  /** Subjects to list. */
  subjects: Subject[]
  /** Shows the actions column; only ADMIN can manage subjects. */
  canManage: boolean
  /** Called to edit a subject. */
  onEdit: (subject: Subject) => void
  /** Called to delete a subject. */
  onDelete: (subject: Subject) => void
}

/**
 * Catalog table with code, name and credits.
 */
export function SubjectTable({ subjects, canManage, onEdit, onDelete }: SubjectTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead className="text-right">Créditos</TableHead>
          {canManage && (
            <TableHead className="w-24">
              <span className="sr-only">Acciones</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject.id}>
            <TableCell className="font-medium">{subject.code}</TableCell>
            <TableCell>{subject.name}</TableCell>
            <TableCell className="text-right">{subject.credits}</TableCell>
            {canManage && (
              <TableCell>
                <SubjectRowActions subject={subject} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
