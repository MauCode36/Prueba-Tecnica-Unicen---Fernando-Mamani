import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { getMe } from '../services/auth.service'
import { authKeys } from './auth.keys'

/**
 * Validates the stored session against GET /auth/me and keeps the
 * global user in sync with the server profile.
 * @returns The current user query.
 */
export function useCurrentUser() {
  const { isAuthenticated, updateUser } = useAuth()
  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (query.data) updateUser(query.data)
  }, [query.data, updateUser])

  return query
}
