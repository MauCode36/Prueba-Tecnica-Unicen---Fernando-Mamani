import { z } from 'zod'

const baseStudentSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa el nombre').max(150, 'Máximo 150 caracteres'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Ingresa el correo')
    .email('Ingresa un correo válido')
    .max(255, 'Máximo 255 caracteres'),
  studentCode: z
    .string()
    .trim()
    .min(1, 'Ingresa el código')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones')
    .transform((value) => value.toUpperCase()),
  program: z.string().trim().min(1, 'Ingresa la carrera').max(150, 'Máximo 150 caracteres'),
})

/**
 * Shape validation to register a student. Duplicate code or email are
 * answered by the API (409) and shown as toasts.
 */
export const createStudentSchema = baseStudentSchema.extend({
  password: z.string().min(6, 'Mínimo 6 caracteres').max(72, 'Máximo 72 caracteres'),
})

/** Shape validation to edit a student; the password is not part of the edit form. */
export const updateStudentSchema = baseStudentSchema

/** Raw form values; `password` stays empty while editing. */
export type StudentFormInput = z.input<typeof createStudentSchema>
/** Parsed form values; `password` is only meaningful when creating. */
export type StudentFormValues = z.output<typeof createStudentSchema>
