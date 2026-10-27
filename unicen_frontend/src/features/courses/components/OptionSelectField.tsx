import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { SelectOption } from '../types'

interface OptionSelectFieldProps {
  /** Id linking the label to the trigger. */
  id: string
  /** Spanish label. */
  label: string
  /** Spanish placeholder shown with no value. */
  placeholder: string
  /** Options to pick from. */
  options: SelectOption[]
  /** Selected value, empty when none. */
  value: string
  /** Called with the new value. */
  onChange: (value: string) => void
  /** Validation message, if any. */
  error?: string
  /** Disables the select, for example while options load. */
  isDisabled?: boolean
}

/**
 * Labeled select bound to a list of `{ value, label }` options.
 */
export function OptionSelectField({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  isDisabled,
}: OptionSelectFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={options}
        value={value || null}
        onValueChange={(next) => onChange(next ?? '')}
        disabled={isDisabled}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={[error ? { message: error } : undefined]} />
    </Field>
  )
}
