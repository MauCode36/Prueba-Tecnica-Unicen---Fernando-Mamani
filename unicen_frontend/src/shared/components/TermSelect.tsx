import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { buildTermOptions, formatTerm } from '@/shared/lib/term.utils'

interface TermSelectProps {
  /** Selected term, for example `2026-2`. */
  value: string
  /** Called with the newly picked term. */
  onChange: (term: string) => void
}

/**
 * Term picker for the offering views. The list is built around the selected term.
 */
export function TermSelect({ value, onChange }: TermSelectProps) {
  const options = buildTermOptions(value).map((term) => ({ value: term, label: formatTerm(term) }))

  return (
    <Select items={options} value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger aria-label="Gestión" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
