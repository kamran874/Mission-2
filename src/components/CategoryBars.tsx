import type { CategoryTotal } from '../lib/reports'
import { formatMoney } from '../lib/currency'

export function CategoryBars({ rows, currency }: { rows: CategoryTotal[]; currency: string }) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
        No expenses in this period yet.
      </p>
    )
  }

  const maxPercent = Math.max(...rows.map((r) => r.percent), 0.01)

  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((row) => (
        <div key={row.category.id}>
          <div className="mb-1 flex items-center justify-between text-[13.5px]">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: `var(--${row.category.color})` }}
              />
              {row.category.icon} {row.category.name}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {formatMoney(row.amount, currency)} · {Math.round(row.percent * 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full" style={{ background: 'var(--gridline)' }}>
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.max((row.percent / maxPercent) * 100, 3)}%`,
                background: `var(--${row.category.color})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
