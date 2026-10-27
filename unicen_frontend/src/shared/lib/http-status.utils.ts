import axios from 'axios'

/**
 * Reads the HTTP status of a failed API call.
 * @param error - Unknown error thrown by a service call.
 * @returns The response status, or `undefined` when there was no response.
 */
export function getHttpStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

/**
 * Tells whether an error is a 4xx response, which retrying cannot fix.
 * @param error - Unknown error thrown by a service call.
 * @returns `true` for client errors.
 */
export function isClientError(error: unknown): boolean {
  const status = getHttpStatus(error)
  return status !== undefined && status >= 400 && status < 500
}
