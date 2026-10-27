import { Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { StudentStatusFilter } from '../types'

const STATUS_OPTIONS: { value: StudentStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]

interface StudentFiltersProps {
  /** Text typed in the search box. */
  searchInput: string
  /** Called on every keystroke; the URL updates after a pause. */
  onSearchChange: (value: string) => void
  /** Selected activity filter. */
  status: StudentStatusFilter
  /** Called with the new activity filter. */
  onStatusChange: (status: StudentStatusFilter) => void
}

/**
 * Search box and activity filter of the students list.
 */
export function StudentFilters({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
}: StudentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-sm">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          aria-label="Buscar estudiantes"
          placeholder="Buscar por nombre, correo o código"
          className="pl-8"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Select
        items={STATUS_OPTIONS}
        value={status}
        onValueChange={(next) => next && onStatusChange(next)}
      >
        <SelectTrigger aria-label="Estado" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
