import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { getDefaultRouteByRole } from '../utils/role-navigation.utils'

/**
 * Shown at /403 when the user's role cannot access the requested page.
 */
export function ForbiddenPage() {
  const { user } = useAuth()
  const homeRoute = user ? getDefaultRouteByRole(user.role) : '/login'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-xs font-semibold tracking-widest text-accent-text uppercase">Error 403</p>
      <h1 className="text-4xl font-bold tracking-tight text-ink">Acceso no autorizado</h1>
      <p className="max-w-md text-ink-muted">
        Tu rol actual no tiene permisos para ver esta pantalla.
      </p>
      <Button render={<Link to={homeRoute} />} nativeButton={false}>
        Volver al inicio
      </Button>
    </main>
  )
}
