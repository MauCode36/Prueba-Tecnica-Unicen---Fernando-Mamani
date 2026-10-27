import type { ReactNode } from 'react'
import { Button } from '@/shared/components/ui/button'

interface DataStateProps {
  /** True while the first load is in flight. */
  isLoading: boolean
  /** True when the request failed. */
  isError: boolean
  /** True when the request succeeded but returned no rows. */
  isEmpty: boolean
  /** Spanish message shown for the empty state. */
  emptyMessage: string
  /** Optional action shown under the empty message, for example a link. */
  emptyAction?: ReactNode
  /** Placeholder rendered while loading. */
  loadingFallback: ReactNode
  /** Retries the failed request. */
  onRetry: () => void
  /** Content rendered when there is data. */
  children: ReactNode
}

/**
 * Renders the loading, error and empty states of a data view, so each
 * table or list only describes its happy path.
 */
export function DataState({
  isLoading,
  isError,
  isEmpty,
  emptyMessage,
  emptyAction,
  loadingFallback,
  onRetry,
  children,
}: DataStateProps) {
  if (isLoading) return <>{loadingFallback}</>

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-border p-8 text-center">
        <p className="text-ink">No pudimos cargar la información.</p>
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center text-ink-muted">
        <p>{emptyMessage}</p>
        {emptyAction}
      </div>
    )
  }

  return <>{children}</>
}
