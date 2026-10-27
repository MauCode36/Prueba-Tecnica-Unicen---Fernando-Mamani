import { z } from 'zod'

/**
 * Shape validation for the subject form. Uniqueness and usage rules
 * belong to the API and surface as toasts.
 */
export const subjectSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Ingresa el código')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones')
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, 'Ingresa el nombre').max(150, 'Máximo 150 caracteres'),
  credits: z.coerce
    .number<unknown>()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 crédito')
    .max(20, 'Máximo 20 créditos'),
})

/** Raw form values (what the inputs hold). */
export type SubjectFormInput = z.input<typeof subjectSchema>
/** Parsed values sent to the API (coerced and uppercased). */
export type SubjectFormValues = z.output<typeof subjectSchema>
