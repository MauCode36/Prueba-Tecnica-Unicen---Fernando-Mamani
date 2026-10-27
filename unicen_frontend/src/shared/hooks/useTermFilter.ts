import { useSearchParams } from 'react-router'
import { getCurrentTerm, isValidTerm } from '@/shared/lib/term.utils'

/**
 * Keeps the selected term in the URL (`?term=`) so the view can be shared and
 * survives a reload. A missing or malformed value falls back to the current term; other
 * query params are kept when the term changes.
 * @returns The active term and a setter.
 */
export function useTermFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const param = searchParams.get('term')
  const term = isValidTerm(param) ? param : getCurrentTerm()

  const setTerm = (next: string) =>
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        params.set('term', next)
        return params
      },
      { replace: true },
    )

  return { term, setTerm }
}
