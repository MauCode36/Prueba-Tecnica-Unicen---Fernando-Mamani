import axios from 'axios'
import type { ApiErrorResponse } from '@/shared/types'

/**
 * Extracts the user-facing message from an API error.
 * @param error - Unknown error thrown by a service call.
 * @param fallback - Message used when the API provides none.
 * @returns The backend message, or the fallback.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado',
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join('. ')
    if (message) return message
  }
  return fallback
}
