import { useMemo, useState } from 'react'
import { useLedger } from '../store'
import { ExpenseForm } from '../components/ExpenseForm'
import { ExpenseRow } from '../components/ExpenseRow'
import { addDays, daysBetween, formatLong, formatShort, isToday, todayISO, weekdayLabel } from '../lib/date'
import { formatMoney } from '../lib/currency'
import type { Expense } from '../types'

const PAGE_SIZE = 14

export function History() {
  const { expenses, categories, settings, addExpense, updateExpense, deleteExpense } = useLedger()
  const [visibleDays, setVisibleDays] = useState(PAGE_SIZE)
  const [formOpen, setFormOpen] = useState(false)
  const [formDate, setFormDate] = useState<string>(todayISO())
  const [editing, setEditing] = useState<Expense | null>(null)

  const today = todayISO()
  const totalDays = Math.max(daysBetween(settings.startDate, today) + 1, 1)

  const byDate = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const e of expenses) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    for (const list of map.values()) list.sort((a, b) => b.createdAt - a.createdAt)
    return map
  }, [expenses])

  const days = useMemo(() => {
    const count = Math.min(visibleDays, totalDays)
    return Array.from({ length: count }, (_, i) => addDays(today, -i))
  }, [visibleDays, totalDays, today])

  function categoryFor(id: string) {
    return categories.find((c) => c.id === id)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  function openAddFor(date: string) {
    setFormDate(date)
    setEditing(null)
    setFormOpen(true)
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28" style={{ paddingTop: 'calc(1.5rem + var(--safe-top))' }}>
      <h1 className="mb-4 text-[24px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        History
      </h1>

      <div className="flex flex-col gap-3">
        {days.map((date) => {
          const dayExpenses = byDate.get(date) ?? []
          const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0)
          return (
            <section key={date} className="rounded-2xl p-3.5" style={{ background: 'var(--surface-card)' }}>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {isToday(date) ? 'Today' : `${weekdayLabel(date)}, ${formatShort(date)}`}
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    {dayExpenses.length} {dayExpenses.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {dayTotal > 0 ? formatMoney(dayTotal, settings.currency) : '—'}
                  </span>
                  <button
                    onClick={() => openAddFor(date)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[16px]"
                    style={{ background: 'var(--surface-page)', color: 'var(--series-1)' }}
                    aria-label={`Add expense for ${formatLong(date)}`}
                  >
                    +
                  </button>
                </div>
              </div>
              {dayExpenses.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {dayExpenses.map((e) => (
                    <ExpenseRow
                      key={e.id}
                      expense={e}
                      category={categoryFor(e.categoryId)}
                      currency={settings.currency}
                      onClick={() => {
                        setEditing(e)
                        setFormDate(e.date)
                        setFormOpen(true)
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {visibleDays < totalDays && (
        <button
          onClick={() => setVisibleDays((v) => v + PAGE_SIZE)}
          className="mt-4 w-full rounded-2xl py-3 text-[14px] font-medium"
          style={{ background: 'var(--surface-card)', color: 'var(--series-1)' }}
        >
          Load earlier days
        </button>
      )}

      {formOpen && (
        <ExpenseForm
          categories={categories}
          editing={editing}
          initialDate={formDate}
          onClose={closeForm}
          onSave={(input) => {
            if (editing) updateExpense(editing.id, input)
            else addExpense(input)
            closeForm()
          }}
          onDelete={
            editing
              ? () => {
                  deleteExpense(editing.id)
                  closeForm()
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
