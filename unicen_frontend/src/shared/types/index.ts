/**
 * System user roles, matching the backend `Role` enum.
 * Declared as a const object because `erasableSyntaxOnly` forbids `enum`.
 */
export const Role = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * Uniform error shape returned by the UNICEN API.
 */
export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
  timestamp?: string
}
