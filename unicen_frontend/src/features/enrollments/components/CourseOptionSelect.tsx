import { Field, FieldLabel } from '@/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { EnrollCourseOption } from '../types'

interface CourseOptionSelectProps {
  /** Courses of the term, with seats in the label. */
  options: EnrollCourseOption[]
  /** Selected course id, empty when none. */
  value: string
  /** Called with the picked course id. */
  onChange: (courseId: string) => void
  /** Disables the select while options load. */
  isDisabled: boolean
}

/**
 * Course select whose labels include the free seats; full courses are visible but disabled.
 */
export function CourseOptionSelect({ options, value, onChange, isDisabled }: CourseOptionSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor="enroll-course">Curso</FieldLabel>
      <Select
        items={options}
        value={value || null}
        onValueChange={(next) => onChange(next ?? '')}
        disabled={isDisabled}
      >
        <SelectTrigger id="enroll-course" className="w-full">
          <SelectValue placeholder={isDisabled ? 'Cargando…' : 'Selecciona un curso'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.isDisabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
