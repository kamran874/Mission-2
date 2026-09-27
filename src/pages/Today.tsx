import { useMemo, useState } from 'react'
import { useLedger } from '../store'
import { ExpenseForm } from '../components/ExpenseForm'
import { ExpenseRow } from '../components/ExpenseRow'
import { StatTile } from '../components/StatTile'
import { formatMoney } from '../lib/currency'
import { formatLong, todayISO } from '../lib/date'
import type { Expense } from '../types'

export function Today() {
  const { expenses, categories, settings, addExpense, updateExpense, deleteExpense } = useLedger()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)

  const today = todayISO()
  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === today).sort((a, b) => b.createdAt - a.createdAt),
    [expenses, today],
  )
  const todayTotal = useMemo(() => todayExpenses.reduce((s, e) => s + e.amount, 0), [todayExpenses])

  const weekTotal = useMemo(() => {
    const d = new Date()
    const day = d.getDay()
    const start = new Date(d)
    start.setDate(d.getDate() - day)
    const startStr = start.toISOString().slice(0, 10)
    return expenses.filter((e) => e.date >= startStr && e.date <= today).reduce((s, e) => s + e.amount, 0)
  }, [expenses, today])

  function categoryFor(id: string) {
    return categories.find((c) => c.id === id)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28" style={{ paddingTop: 'calc(1.5rem + var(--safe-top))' }}>
      <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        {formatLong(today)}
      </p>
      <h1 className="mb-4 text-[24px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        Today's spending
      </h1>

      <div className="mb-5 flex gap-3">
        <StatTile label="Today" value={formatMoney(todayTotal, settings.currency)} />
        <StatTile label="This week" value={formatMoney(weekTotal, settings.currency)} />
      </div>

      {todayExpenses.length === 0 ? (
        <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface-card)' }}>
          <p className="mb-1 text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Nothing logged yet
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Tap the button below to add today's first expense.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {todayExpenses.map((e) => (
            <ExpenseRow
              key={e.id}
              expense={e}
              category={categoryFor(e.categoryId)}
              currency={settings.currency}
              onClick={() => {
                setEditing(e)
                setFormOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
        className="fixed right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full text-[28px] font-light text-white shadow-lg"
        style={{ background: 'var(--series-1)', bottom: 'calc(5.5rem + var(--safe-bottom))' }}
        aria-label="Add expense"
      >
        +
      </button>

      {formOpen && (
        <ExpenseForm
          categories={categories}
          editing={editing}
          initialDate={today}
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
