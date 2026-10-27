import { Controller, type UseFormReturn } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import type { CourseFormInput, CourseFormValues } from '../schemas/course.schema'
import type { CourseOptions } from '../types'
import { OptionSelectField } from './OptionSelectField'

interface CourseFormFieldsProps {
  /** Form instance created by `useCourseForm`. */
  form: UseFormReturn<CourseFormInput, unknown, CourseFormValues>
  /** Subject and teacher options; undefined while loading. */
  options?: CourseOptions
}

/**
 * Subject, teacher, term, section and capacity inputs of the course form.
 */
export function CourseFormFields({ form, options }: CourseFormFieldsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form
  const isLoadingOptions = !options

  return (
    <>
      <Controller
        control={control}
        name="subjectId"
        render={({ field }) => (
          <OptionSelectField
            id="course-subject"
            label="Materia"
            placeholder={isLoadingOptions ? 'Cargando…' : 'Selecciona una materia'}
            options={options?.subjects ?? []}
            value={field.value}
            onChange={field.onChange}
            error={errors.subjectId?.message}
            isDisabled={isLoadingOptions}
          />
        )}
      />
      <Controller
        control={control}
        name="teacherId"
        render={({ field }) => (
          <OptionSelectField
            id="course-teacher"
            label="Docente"
            placeholder={isLoadingOptions ? 'Cargando…' : 'Selecciona un docente'}
            options={options?.teachers ?? []}
            value={field.value}
            onChange={field.onChange}
            error={errors.teacherId?.message}
            isDisabled={isLoadingOptions}
          />
        )}
      />
      <div className="grid grid-cols-3 gap-3">
        <Field data-invalid={!!errors.term}>
          <FieldLabel htmlFor="course-term">Gestión</FieldLabel>
          <Input
            id="course-term"
            placeholder="2026-2"
            autoComplete="off"
            aria-invalid={!!errors.term}
            {...register('term')}
          />
          <FieldError errors={[errors.term]} />
        </Field>
        <Field data-invalid={!!errors.section}>
          <FieldLabel htmlFor="course-section">Paralelo</FieldLabel>
          <Input
            id="course-section"
            placeholder="A"
            autoComplete="off"
            aria-invalid={!!errors.section}
            {...register('section')}
          />
          <FieldError errors={[errors.section]} />
        </Field>
        <Field data-invalid={!!errors.maxCapacity}>
          <FieldLabel htmlFor="course-capacity">Cupo</FieldLabel>
          <Input
            id="course-capacity"
            type="number"
            inputMode="numeric"
            min={1}
            max={500}
            aria-invalid={!!errors.maxCapacity}
            {...register('maxCapacity')}
          />
          <FieldError errors={[errors.maxCapacity]} />
        </Field>
      </div>
    </>
  )
}
