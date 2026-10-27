import type { Role } from '@/shared/types'

/**
 * Authenticated user data returned by the API.
 */
export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

/**
 * Payload for POST /auth/login.
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Response from POST /auth/login.
 */
export interface LoginResponse {
  accessToken: string
  user: AuthUser
}
