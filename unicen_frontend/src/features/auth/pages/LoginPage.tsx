import { Navigate } from 'react-router'
import { BrandMark } from '@/shared/components/BrandMark'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { getDefaultRouteByRole } from '../utils/role-navigation.utils'

/**
 * Login screen with the UNICEN identity. Authenticated users are sent
 * straight to the landing route of their role.
 */
export function LoginPage() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteByRole(user.role)} replace />
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-brand-surface p-12 text-on-brand lg:flex">
        <BrandMark className="text-4xl" />
        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-5xl leading-[1.1] font-bold tracking-tight">
            Gestión académica en un solo lugar
          </h1>
          <p className="text-lg text-on-brand/80">
            Materias, cursos, inscripciones y notas para estudiantes, docentes y administración.
          </p>
        </div>
        <p className="text-sm text-on-brand/70">Sistema académico UNICEN</p>
      </aside>
      <main className="flex items-center justify-center p-4 sm:p-8">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <BrandMark className="text-3xl text-ink lg:hidden" />
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-ink">Inicia sesión</h2>
            <p className="text-ink-muted">Ingresa con tu cuenta institucional.</p>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
