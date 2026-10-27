import { Users } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { Course } from '../types'
import { formatTerm } from '../utils/term.utils'
import { SeatsBadge } from './SeatsBadge'

interface TeacherCourseCardProps {
  /** Course assigned to the teacher. */
  course: Course
}

/**
 * Card of a course assigned to the teacher, linking to its enrolled students.
 */
export function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {course.subject.code} · {course.subject.name}
        </CardTitle>
        <p className="text-sm text-ink-muted">
          Paralelo {course.section} · {formatTerm(course.term)}
        </p>
      </CardHeader>
      <CardContent>
        <SeatsBadge availableSeats={course.availableSeats} maxCapacity={course.maxCapacity} />
      </CardContent>
      <CardFooter>
        <Button variant="outline" render={<Link to={`/courses/${course.id}/students`} />} nativeButton={false}>
          <Users aria-hidden="true" />
          Ver inscritos
        </Button>
      </CardFooter>
    </Card>
  )
}
