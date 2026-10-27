const TERM_PATTERN = /^\d{4}-[12]$/

/**
 * Tells whether a string is a valid term such as `2026-2`.
 * @param term - Value to check, for example from the URL.
 * @returns `true` for the `YYYY-1` and `YYYY-2` formats.
 */
export function isValidTerm(term: string | null | undefined): term is string {
  return !!term && TERM_PATTERN.test(term)
}

/**
 * Returns the academic term of a date: January to June is `YYYY-1`, July to December `YYYY-2`.
 * @param date - Reference date, today by default.
 * @returns The term, for example `2026-2`.
 */
export function getCurrentTerm(date: Date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() < 6 ? 1 : 2}`
}

/**
 * Builds the list of terms offered by the term selector.
 * @param center - Term the list is built around.
 * @param before - Number of terms before `center`.
 * @param after - Number of terms after `center`.
 * @returns Terms in ascending order, `center` included.
 */
export function buildTermOptions(center: string, before = 2, after = 1): string[] {
  const [year, half] = center.split('-').map(Number)
  const centerIndex = year * 2 + (half - 1)
  const terms: string[] = []
  for (let index = centerIndex - before; index <= centerIndex + after; index++) {
    terms.push(`${Math.floor(index / 2)}-${(index % 2) + 1}`)
  }
  return terms
}

/**
 * Formats a term for display.
 * @param term - Term such as `2026-2`.
 * @returns The Spanish label, for example `Gestión 2026-2`.
 */
export function formatTerm(term: string): string {
  return `Gestión ${term}`
}
