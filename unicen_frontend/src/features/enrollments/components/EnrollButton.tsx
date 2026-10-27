import { LoaderCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { useEnrollButtonState } from '../hooks/useEnrollButtonState'
import { useEnrollInCourse } from '../hooks/useEnrollInCourse'
import type { EnrollableCourse } from '../types'

interface EnrollButtonProps {
  /** Course row from the offering; only seats and enrollment status are read. */
  course: EnrollableCourse
}

/**
 * "Inscribirme" button of a course row. It is disabled without seats or when
 * already enrolled (UX only, the API decides) and explains why in a tooltip.
 * A disabled button emits no hover events, so the tooltip hangs from a wrapper.
 */
export function EnrollButton({ course }: EnrollButtonProps) {
  const { isDisabled, reason } = useEnrollButtonState(course)
  const { mutate, isPending } = useEnrollInCourse()

  const button = (
    <Button
      size="sm"
      variant={course.isEnrolled ? 'outline' : 'default'}
      disabled={isDisabled || isPending}
      onClick={() => mutate(course.id)}
    >
      {isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      {isPending ? 'Inscribiendo…' : course.isEnrolled ? 'Inscrito' : 'Inscribirme'}
    </Button>
  )

  if (!isDisabled) return button

  return (
    <Tooltip>
      <TooltipTrigger render={<span tabIndex={0} className="inline-flex" />}>{button}</TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  )
}
