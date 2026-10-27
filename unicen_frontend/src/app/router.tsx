import { createBrowserRouter } from 'react-router'
import { HomeRedirect } from '@/features/auth/components/HomeRedirect'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { CourseStudentsPage } from '@/features/courses/pages/CourseStudentsPage'
import { CoursesPage } from '@/features/courses/pages/CoursesPage'
import { MyCoursesPage } from '@/features/courses/pages/MyCoursesPage'
import { MyEnrollmentsPage } from '@/features/enrollments/pages/MyEnrollmentsPage'
import { StudentEnrollmentsPage } from '@/features/enrollments/pages/StudentEnrollmentsPage'
import { StudentsPage } from '@/features/students/pages/StudentsPage'
import { SubjectsPage } from '@/features/subjects/pages/SubjectsPage'
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
          { path: 'subjects', element: <SubjectsPage /> },
          { path: 'courses', element: <CoursesPage /> },
          {
            element: <ProtectedRoute roles={[Role.TEACHER]} />,
            children: [{ path: 'courses/mine', element: <MyCoursesPage /> }],
          },
          {
            element: <ProtectedRoute roles={[Role.TEACHER, Role.ADMIN]} />,
            children: [{ path: 'courses/:courseId/students', element: <CourseStudentsPage /> }],
          },
          {
            element: <ProtectedRoute roles={[Role.ADMIN]} />,
            children: [
              { path: 'students', element: <StudentsPage /> },
              { path: 'students/:studentId/enrollments', element: <StudentEnrollmentsPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={[Role.STUDENT]} />,
            children: [{ path: 'enrollments', element: <MyEnrollmentsPage /> }],
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
