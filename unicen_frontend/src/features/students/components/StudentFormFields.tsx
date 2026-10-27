import type { UseFormReturn } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import type { StudentFormInput, StudentFormValues } from '../schemas/student.schema'

interface StudentFormFieldsProps {
  /** Form instance created by `useStudentForm`. */
  form: UseFormReturn<StudentFormInput, unknown, StudentFormValues>
  /** Shows the password field; only when registering. */
  hasPassword: boolean
}

/**
 * Name, email, code, program and (when registering) password inputs.
 */
export function StudentFormFields({ form, hasPassword }: StudentFormFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <>
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="student-name">Nombre completo</FieldLabel>
        <Input
          id="student-name"
          autoComplete="off"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="student-email">Correo electrónico</FieldLabel>
        <Input
          id="student-email"
          type="email"
          autoComplete="off"
          placeholder="nombre@unicen.edu.bo"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        <FieldError errors={[errors.email]} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.studentCode}>
          <FieldLabel htmlFor="student-code">Código</FieldLabel>
          <Input
            id="student-code"
            placeholder="S-2026001"
            autoComplete="off"
            aria-invalid={!!errors.studentCode}
            {...register('studentCode')}
          />
          <FieldError errors={[errors.studentCode]} />
        </Field>
        <Field data-invalid={!!errors.program}>
          <FieldLabel htmlFor="student-program">Carrera</FieldLabel>
          <Input
            id="student-program"
            autoComplete="off"
            aria-invalid={!!errors.program}
            {...register('program')}
          />
          <FieldError errors={[errors.program]} />
        </Field>
      </div>
      {hasPassword && (
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="student-password">Contraseña inicial</FieldLabel>
          <Input
            id="student-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <FieldError errors={[errors.password]} />
        </Field>
      )}
    </>
  )
}
