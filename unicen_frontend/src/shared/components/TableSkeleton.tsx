import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableRow } from '@/shared/components/ui/table'

interface TableSkeletonProps {
  /** Number of placeholder rows. */
  rows?: number
  /** Number of placeholder columns. */
  columns: number
}

/**
 * Placeholder rows shown while a table loads.
 */
export function TableSkeleton({ rows = 5, columns }: TableSkeletonProps) {
  return (
    <Table aria-busy="true" aria-label="Cargando datos">
      <TableBody>
        {Array.from({ length: rows }, (_, row) => (
          <TableRow key={row}>
            {Array.from({ length: columns }, (_, column) => (
              <TableCell key={column}>
                <Skeleton className="h-5 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
