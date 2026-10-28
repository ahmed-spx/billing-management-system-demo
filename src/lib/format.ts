/**
 * Display formatting for precomputed numbers. Presentation only — the frontend
 * never performs billing math.
 */

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format a dollar amount, e.g. 1200 → "$1,200.00". */
export function money(amount: number): string {
  return usd.format(amount)
}

/** Format hours, trimming to at most one decimal, e.g. 2.5 → "2.5h". */
export function hours(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}h`
}

/** Short date for tables, e.g. "2026-10-02" → "Oct 2". */
export function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Today's date as an ISO yyyy-mm-dd string (for prefilled entry dates). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
