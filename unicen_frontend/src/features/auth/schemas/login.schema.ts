import { z } from 'zod'

/**
 * Shape validation for the login form; credentials are verified by the API.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Ingresa tu correo').email('Ingresa un correo válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
