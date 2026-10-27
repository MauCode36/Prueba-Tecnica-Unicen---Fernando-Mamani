const dateFormatter = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/**
 * Formats an ISO 8601 date string for display.
 * @param iso - Date string returned by the API.
 * @returns The date as `dd/mm/yyyy`, or an empty string when it is invalid.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}
