import { cn } from '@/shared/lib/utils'

interface BrandMarkProps {
  /** Extra classes, e.g. text size and color. */
  className?: string
}

/**
 * UNICEN wordmark with the orange dot set inside the "C".
 * Inherits its color from the parent; the dot is always brand orange.
 */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      role="img"
      aria-label="UNICEN"
      className={cn('inline-flex items-center font-bold tracking-tight uppercase', className)}
    >
      <span aria-hidden="true">UNI</span>
      <span aria-hidden="true" className="relative">
        C
        <span className="absolute top-1/2 left-[46%] size-[0.16em] -translate-y-1/2 rounded-full bg-orange" />
      </span>
      <span aria-hidden="true">EN</span>
    </span>
  )
}
