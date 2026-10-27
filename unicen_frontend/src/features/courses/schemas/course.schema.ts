import { z } from 'zod'

/**
 * Shape validation for the course form. Duplicates, capacity below
 * enrollments and teacher validity are business rules of the API.
 */
export const courseSchema = z.object({
  subjectId: z.string().uuid('Selecciona una materia'),
  teacherId: z.string().uuid('Selecciona un docente'),
  term: z.string().regex(/^\d{4}-[12]$/, 'Formato AAAA-1 o AAAA-2'),
  section: z
    .string()
    .trim()
    .min(1, 'Ingresa el paralelo')
    .max(10, 'Máximo 10 caracteres')
    .transform((value) => value.toUpperCase()),
  maxCapacity: z.coerce
    .number<unknown>()
    .int('Debe ser un número entero')
    .min(1, 'El cupo debe ser mayor a 0')
    .max(500, 'Máximo 500 cupos'),
})

/** Raw form values (what the inputs hold). */
export type CourseFormInput = z.input<typeof courseSchema>
/** Parsed values sent to the API. */
export type CourseFormValues = z.output<typeof courseSchema>
