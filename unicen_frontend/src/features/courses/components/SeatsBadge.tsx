import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import { formatSeats, getSeatsTone } from '../utils/seats.utils'

interface SeatsBadgeProps {
  /** Seats left in the course. */
  availableSeats: number
  /** Course capacity. */
  maxCapacity: number
}

/**
 * Seat availability pill. Presentation only: no orange, which DESIGN.md
 * reserves for a single accent per view.
 */
export function SeatsBadge({ availableSeats, maxCapacity }: SeatsBadgeProps) {
  const tone = getSeatsTone(availableSeats, maxCapacity)

  return (
    <Badge
      variant={tone === 'none' ? 'destructive' : 'secondary'}
      className={cn(
        tone !== 'none' && 'bg-navy-tint text-ink-muted',
        tone === 'low' && 'font-bold text-ink',
      )}
    >
      {formatSeats(availableSeats, maxCapacity)}
    </Badge>
  )
}
