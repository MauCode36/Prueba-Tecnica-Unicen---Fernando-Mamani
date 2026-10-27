import { EnrollButton } from '@/features/enrollments'
import { Badge } from '@/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { Course } from '../types'
import { SeatsBadge } from './SeatsBadge'

interface CourseOfferTableProps {
  /** Courses of the selected term. */
  courses: Course[]
  /** Shows the enroll button; only STUDENT enrolls themselves. */
  canEnroll: boolean
}

/**
 * Offering for STUDENT and TEACHER. STUDENT also gets the enroll button;
 * TEACHER stays read-only.
 */
export function CourseOfferTable({ courses, canEnroll }: CourseOfferTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Materia</TableHead>
          <TableHead className="text-right">Créditos</TableHead>
          <TableHead>Paralelo</TableHead>
          <TableHead>Docente</TableHead>
          <TableHead>Cupos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-32">
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
            <TableCell className="text-right">{course.subject.credits}</TableCell>
            <TableCell>{course.section}</TableCell>
            <TableCell>{course.teacher.name}</TableCell>
            <TableCell>
              <SeatsBadge availableSeats={course.availableSeats} maxCapacity={course.maxCapacity} />
            </TableCell>
            <TableCell>{course.isEnrolled && <Badge variant="outline">Inscrito</Badge>}</TableCell>
            <TableCell>{canEnroll && <EnrollButton course={course} />}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
