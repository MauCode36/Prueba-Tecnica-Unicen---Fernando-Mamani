import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/error.utils'
import { useAuth } from './useAuth'
import { login } from '../services/auth.service'
import { getDefaultRouteByRole } from '../utils/role-navigation.utils'

interface LocationState {
  from?: { pathname: string }
}

/**
 * Logs the user in, stores the session and redirects to the page they
 * originally requested, or to the default route of their role.
 * @returns The login mutation.
 */
export function useLogin() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: login,
    onSuccess: ({ accessToken, user }) => {
      auth.login(accessToken, user)
      toast.success(`Bienvenido, ${user.name}`)
      const from = (location.state as LocationState | null)?.from?.pathname
      navigate(from ?? getDefaultRouteByRole(user.role), { replace: true })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Credenciales inválidas'))
    },
  })
}
