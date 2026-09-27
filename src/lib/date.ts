export function toISODate(d: Date): string {
  const tz = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tz * 60000)
  return local.toISOString().slice(0, 10)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(s: string, days: number): string {
  const d = parseISO(s)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function daysBetween(a: string, b: string): number {
  const da = parseISO(a)
  const db = parseISO(b)
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}

export function startOfWeek(s: string): string {
  const d = parseISO(s)
  const day = d.getDay() // 0 = Sunday
  d.setDate(d.getDate() - day)
  return toISODate(d)
}

export function startOfMonth(s: string): string {
  const d = parseISO(s)
  d.setDate(1)
  return toISODate(d)
}

export function endOfMonth(s: string): string {
  const d = parseISO(s)
  d.setMonth(d.getMonth() + 1, 0)
  return toISODate(d)
}

export function formatShort(s: string): string {
  return parseISO(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatLong(s: string): string {
  return parseISO(s).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatMonthYear(s: string): string {
  return parseISO(s).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function weekdayLabel(s: string): string {
  return parseISO(s).toLocaleDateString(undefined, { weekday: 'short' })
}

export function isToday(s: string): boolean {
  return s === todayISO()
}
