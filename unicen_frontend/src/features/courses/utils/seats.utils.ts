/** Visual tone of a seats badge. */
export type SeatsTone = 'none' | 'low' | 'ok'

/**
 * Classifies seat availability for presentation only; the API decides
 * whether an enrollment is allowed.
 * @param available - Seats left.
 * @param max - Course capacity.
 * @returns `none` with no seats, `low` at 20 % or less of the capacity, otherwise `ok`.
 */
export function getSeatsTone(available: number, max: number): SeatsTone {
  if (available <= 0) return 'none'
  return available <= max * 0.2 ? 'low' : 'ok'
}

/**
 * Formats seat availability for display.
 * @param available - Seats left.
 * @param max - Course capacity.
 * @returns For example `12 / 30 disponibles`, or `Sin cupos`.
 */
export function formatSeats(available: number, max: number): string {
  return available <= 0 ? 'Sin cupos' : `${available} / ${max} disponibles`
}
