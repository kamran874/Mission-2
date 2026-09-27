import type { Category, Expense, ReportPeriod } from '../types'
import { addDays, daysBetween, endOfMonth, startOfMonth, startOfWeek, todayISO } from './date'

export interface DateRange {
  start: string
  end: string
  label: string
}

const PERIOD_DAYS: Record<Exclude<ReportPeriod, 'monthly'>, number> = {
  weekly: 7,
  biweekly: 14,
}

/** Returns the range containing `anchor`, offset by `offset` periods (negative = past). */
export function getRange(period: ReportPeriod, anchor: string, offset: number): DateRange {
  if (period === 'monthly') {
    const d = new Date(anchor)
    d.setMonth(d.getMonth() + offset, 1)
    const start = startOfMonth(d.toISOString().slice(0, 10))
    const end = endOfMonth(start)
    return { start, end, label: '' }
  }
  const days = PERIOD_DAYS[period]
  const anchorWeekStart = startOfWeek(anchor)
  const start = addDays(anchorWeekStart, offset * days)
  const end = addDays(start, days - 1)
  return { start, end, label: '' }
}

export function inRange(date: string, range: DateRange): boolean {
  return date >= range.start && date <= range.end
}

export function expensesInRange(expenses: Expense[], range: DateRange): Expense[] {
  return expenses.filter((e) => inRange(e.date, range))
}

export function total(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

export interface CategoryTotal {
  category: Category
  amount: number
  percent: number
}

export function byCategory(expenses: Expense[], categories: Category[]): CategoryTotal[] {
  const sums = new Map<string, number>()
  for (const e of expenses) sums.set(e.categoryId, (sums.get(e.categoryId) ?? 0) + e.amount)
  const grand = total(expenses)
  const rows: CategoryTotal[] = []
  for (const [categoryId, amount] of sums) {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) continue
    rows.push({ category, amount, percent: grand > 0 ? amount / grand : 0 })
  }
  return rows.sort((a, b) => b.amount - a.amount)
}

export interface DayTotal {
  date: string
  amount: number
}

export function byDay(expenses: Expense[], range: DateRange): DayTotal[] {
  const sums = new Map<string, number>()
  for (const e of expenses) sums.set(e.date, (sums.get(e.date) ?? 0) + e.amount)
  const days: DayTotal[] = []
  const n = daysBetween(range.start, range.end) + 1
  for (let i = 0; i < n; i++) {
    const date = addDays(range.start, i)
    days.push({ date, amount: sums.get(date) ?? 0 })
  }
  return days
}

export function rangeLabel(period: ReportPeriod, range: DateRange): string {
  const s = new Date(range.start)
  const e = new Date(range.end)
  if (period === 'monthly') {
    return s.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }
  const sameMonth = s.getMonth() === e.getMonth()
  const startLabel = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endLabel = e.toLocaleDateString(undefined, sameMonth ? { day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startLabel} – ${endLabel}`
}

export function isCurrentRange(range: DateRange): boolean {
  const t = todayISO()
  return inRange(t, range)
}
