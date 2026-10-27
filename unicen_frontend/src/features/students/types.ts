/** Student profile joined with its user account. */
export interface Student {
  id: string
  userId: string
  studentCode: string
  name: string
  email: string
  program: string
  isActive: boolean
  createdAt: string
}

/** Payload for POST /students. */
export interface CreateStudentRequest {
  name: string
  email: string
  password: string
  studentCode: string
  program: string
}

/** Payload for PATCH /students/:id; the password is not editable here. */
export type UpdateStudentRequest = Partial<Omit<CreateStudentRequest, 'password'>>

/** Mirrors ListStudentsQueryDto. */
export interface StudentsFilters {
  search?: string
  isActive?: boolean
}

/** Activity filter as shown in the UI and kept in the URL. */
export type StudentStatusFilter = 'all' | 'active' | 'inactive'
