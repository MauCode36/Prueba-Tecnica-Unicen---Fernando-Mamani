import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { Course } from '../types'
import { CourseRowActions } from './CourseRowActions'

interface CourseManagementTableProps {
  /** Courses of the selected term. */
  courses: Course[]
  /** Called to edit a course. */
  onEdit: (course: Course) => void
  /** Called to delete a course. */
  onDelete: (course: Course) => void
}

/**
 * ADMIN table: subject, section, teacher, capacity, enrolled and actions.
 */
export function CourseManagementTable({ courses, onEdit, onDelete }: CourseManagementTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Materia</TableHead>
          <TableHead>Paralelo</TableHead>
          <TableHead>Docente</TableHead>
          <TableHead className="text-right">Cupo</TableHead>
          <TableHead className="text-right">Inscritos</TableHead>
          <TableHead className="w-36">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell>
              <span className="font-medium">{course.subject.code}</span> · {course.subject.name}
            </TableCell>
            <TableCell>{course.section}</TableCell>
            <TableCell>{course.teacher.name}</TableCell>
            <TableCell className="text-right">{course.maxCapacity}</TableCell>
            <TableCell className="text-right">{course.enrolledCount}</TableCell>
            <TableCell>
              <CourseRowActions course={course} onEdit={onEdit} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
