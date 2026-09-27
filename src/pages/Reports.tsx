import { useMemo, useState } from 'react'
import { useLedger } from '../store'
import { StatTile } from '../components/StatTile'
import { DailyBarChart } from '../components/DailyBarChart'
import { CategoryBars } from '../components/CategoryBars'
import { byCategory, byDay, expensesInRange, getRange, isCurrentRange, rangeLabel, total } from '../lib/reports'
import { formatMoney } from '../lib/currency'
import { todayISO } from '../lib/date'
import type { ReportPeriod } from '../types'

const PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Bi-weekly' },
  { id: 'monthly', label: 'Monthly' },
]

export function Reports() {
  const { expenses, categories, settings } = useLedger()
  const [period, setPeriod] = useState<ReportPeriod>('weekly')
  const [offset, setOffset] = useState(0)
  const today = todayISO()

  function changePeriod(p: ReportPeriod) {
    setPeriod(p)
    setOffset(0)
  }

  const range = useMemo(() => getRange(period, today, offset), [period, offset, today])
  const prevRange = useMemo(() => getRange(period, today, offset - 1), [period, offset, today])

  const rangeExpenses = useMemo(() => expensesInRange(expenses, range), [expenses, range])
  const prevExpenses = useMemo(() => expensesInRange(expenses, prevRange), [expenses, prevRange])

  const rangeTotal = total(rangeExpenses)
  const prevTotal = total(prevExpenses)
  const delta = prevTotal > 0 ? ((rangeTotal - prevTotal) / prevTotal) * 100 : null

  const dayTotals = useMemo(() => byDay(rangeExpenses, range), [rangeExpenses, range])
  const categoryTotals = useMemo(() => byCategory(rangeExpenses, categories), [rangeExpenses, categories])

  const canGoNext = offset < 0
  const canGoBack = prevRange.end >= settings.startDate

  const avgPerDay = dayTotals.length > 0 ? rangeTotal / dayTotals.length : 0
  const topCategory = categoryTotals[0]

  return (
    <div className="mx-auto max-w-md px-4 pb-28" style={{ paddingTop: 'calc(1.5rem + var(--safe-top))' }}>
      <h1 className="mb-4 text-[24px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        Reports
      </h1>

      <div className="mb-4 flex rounded-2xl p-1" style={{ background: 'var(--surface-card)' }}>
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => changePeriod(p.id)}
            className="flex-1 rounded-xl py-2 text-[13.5px] font-medium transition-colors"
            style={{
              background: p.id === period ? 'var(--series-1)' : 'transparent',
              color: p.id === period ? 'white' : 'var(--text-secondary)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setOffset((o) => o - 1)}
          disabled={!canGoBack}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[15px]"
          style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', opacity: canGoBack ? 1 : 0.3 }}
        >
          ‹
        </button>
        <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {rangeLabel(period, range)}
          {isCurrentRange(range) && (
            <span className="ml-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--series-1)', color: 'white' }}>
              Current
            </span>
          )}
        </span>
        <button
          onClick={() => setOffset((o) => o + 1)}
          disabled={!canGoNext}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[15px]"
          style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', opacity: canGoNext ? 1 : 0.3 }}
        >
          ›
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <StatTile
          label="Total spent"
          value={formatMoney(rangeTotal, settings.currency)}
          delta={delta !== null ? { percent: delta } : null}
        />
        <StatTile label="Avg / day" value={formatMoney(avgPerDay, settings.currency)} />
      </div>

      <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--surface-card)' }}>
        <h2 className="mb-3 text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Daily spending
        </h2>
        <DailyBarChart data={dayTotals} currency={settings.currency} labelEvery={period === 'monthly' ? 5 : 1} />
      </div>

      <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--surface-card)' }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Where it went
          </h2>
          {topCategory && (
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Top: {topCategory.category.name}
            </span>
          )}
        </div>
        <CategoryBars rows={categoryTotals} currency={settings.currency} />
      </div>
    </div>
  )
}
