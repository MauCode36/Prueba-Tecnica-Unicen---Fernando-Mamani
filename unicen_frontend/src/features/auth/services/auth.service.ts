import { httpClient } from '@/shared/api/httpClient'
import type { AuthUser, LoginRequest, LoginResponse } from '../types'

/**
 * Authenticates a user with email and password.
 * @param payload - Login credentials.
 * @returns The access token and the authenticated user.
 * @throws {AxiosError} When the credentials are invalid.
 */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/auth/login', payload)
  return data
}

/**
 * Fetches the profile of the authenticated user.
 * @returns The current user.
 * @throws {AxiosError} When the token is missing or invalid.
 */
export async function getMe(): Promise<AuthUser> {
  const { data } = await httpClient.get<AuthUser>('/auth/me')
  return data
}
