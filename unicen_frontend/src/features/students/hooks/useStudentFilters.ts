import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { StudentStatusFilter, StudentsFilters } from '../types'

const SEARCH_DEBOUNCE_MS = 300

function parseStatus(value: string | null): StudentStatusFilter {
  return value === 'active' || value === 'inactive' ? value : 'all'
}

/**
 * Keeps the student filters in the URL (`?search=&status=`). The text input
 * is local and reaches the URL after a short pause, so each keystroke does
 * not trigger a request.
 * @returns The input value and setters, the status, and the API filters.
 */
export function useStudentFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const status = parseStatus(searchParams.get('status'))
  const [searchInput, setSearchInput] = useState(search)

  const updateParam = (key: string, value: string) =>
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        if (value) params.set(key, value)
        else params.delete(key)
        return params
      },
      { replace: true },
    )

  useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === search) return
    const timeout = setTimeout(() => updateParam('search', trimmed), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
    // updateParam only wraps setSearchParams, which is stable enough for this debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, search])

  const setStatus = (next: StudentStatusFilter) =>
    updateParam('status', next === 'all' ? '' : next)

  const filters: StudentsFilters = {
    search: search || undefined,
    isActive: status === 'all' ? undefined : status === 'active',
  }

  return { searchInput, setSearchInput, status, setStatus, filters }
}
