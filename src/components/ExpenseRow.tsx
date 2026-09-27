import type { Category, Expense } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { formatMoney } from '../lib/currency'

export function ExpenseRow({
  expense,
  category,
  currency,
  onClick,
}: {
  expense: Expense
  category?: Category
  currency: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors active:opacity-70"
      style={{ background: 'var(--surface-card)' }}
    >
      <CategoryBadge category={category ?? { id: 'other', name: 'Other', icon: '📦', color: 'series-6' }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {category?.name ?? 'Other'}
        </p>
        {expense.note && (
          <p className="truncate text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {expense.note}
          </p>
        )}
      </div>
      <span className="shrink-0 text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {formatMoney(expense.amount, currency)}
      </span>
    </button>
  )
}
