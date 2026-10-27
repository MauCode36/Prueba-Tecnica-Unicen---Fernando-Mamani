import { createBrowserRouter } from 'react-router'
import { HomeRedirect } from '@/features/auth/components/HomeRedirect'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { PlaceholderPage } from '@/shared/components/PlaceholderPage'
import { Role } from '@/shared/types'
import { AuthLayout } from './layouts/AuthLayout'
import { DashboardLayout } from './layouts/DashboardLayout'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/403', element: <ForbiddenPage /> },
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          // Replace each placeholder with the real page as its feature is built.
          { path: 'subjects', element: <PlaceholderPage title="Materias" /> },
          { path: 'courses', element: <PlaceholderPage title="Oferta de cursos" /> },
          {
            element: <ProtectedRoute roles={[Role.ADMIN]} />,
            children: [{ path: 'students', element: <PlaceholderPage title="Estudiantes" /> }],
          },
          {
            element: <ProtectedRoute roles={[Role.ADMIN, Role.STUDENT]} />,
            children: [{ path: 'enrollments', element: <PlaceholderPage title="Inscripciones" /> }],
          },
          {
            element: <ProtectedRoute roles={[Role.STUDENT]} />,
            children: [
              { path: 'grades/history', element: <PlaceholderPage title="Historial académico" /> },
            ],
          },
        ],
      },
    ],
  },
])
