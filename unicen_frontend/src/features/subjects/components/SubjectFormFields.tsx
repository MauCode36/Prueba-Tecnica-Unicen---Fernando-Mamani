import type { UseFormReturn } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import type { SubjectFormInput, SubjectFormValues } from '../schemas/subject.schema'

interface SubjectFormFieldsProps {
  /** Form instance created by `useSubjectForm`. */
  form: UseFormReturn<SubjectFormInput, unknown, SubjectFormValues>
}

/**
 * Code, name and credits inputs of the subject form.
 */
export function SubjectFormFields({ form }: SubjectFormFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <>
      <Field data-invalid={!!errors.code}>
        <FieldLabel htmlFor="subject-code">Código</FieldLabel>
        <Input
          id="subject-code"
          placeholder="MAT-101"
          autoComplete="off"
          aria-invalid={!!errors.code}
          {...register('code')}
        />
        <FieldError errors={[errors.code]} />
      </Field>
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="subject-name">Nombre</FieldLabel>
        <Input
          id="subject-name"
          placeholder="Cálculo I"
          autoComplete="off"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field data-invalid={!!errors.credits}>
        <FieldLabel htmlFor="subject-credits">Créditos</FieldLabel>
        <Input
          id="subject-credits"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          aria-invalid={!!errors.credits}
          {...register('credits')}
        />
        <FieldError errors={[errors.credits]} />
      </Field>
    </>
  )
}
