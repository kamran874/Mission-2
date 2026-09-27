import { useEffect, useState } from 'react'
import type { Category, Expense } from '../types'
import { todayISO } from '../lib/date'

export function ExpenseForm({
  categories,
  initialDate,
  editing,
  onSave,
  onDelete,
  onClose,
}: {
  categories: Category[]
  initialDate?: string
  editing?: Expense | null
  onSave: (input: { date: string; amount: number; categoryId: string; note: string }) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? categories[0]?.id ?? '')
  const [date, setDate] = useState(editing?.date ?? initialDate ?? todayISO())
  const [note, setNote] = useState(editing?.note ?? '')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const numericAmount = Number(amount)
  const canSave = amount.trim() !== '' && numericAmount > 0 && categoryId !== ''

  function handleSave() {
    if (!canSave) return
    onSave({ date, amount: numericAmount, categoryId, note: note.trim() })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-t-3xl p-5"
        style={{ background: 'var(--surface-page)', paddingBottom: 'calc(1.5rem + var(--safe-bottom))', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: 'var(--baseline)' }} />
        <h2 className="mb-4 text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {editing ? 'Edit expense' : 'Add expense'}
        </h2>

        <label className="mb-1 block text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Amount
        </label>
        <div className="mb-4 flex items-center rounded-2xl px-4 py-3" style={{ background: 'var(--surface-card)' }}>
          <span className="mr-1 text-[22px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            $
          </span>
          <input
            autoFocus
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="w-full bg-transparent text-[22px] font-semibold outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <label className="mb-1 block text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Category
        </label>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {categories.map((c) => {
            const active = c.id === categoryId
            return (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className="flex flex-col items-center gap-1 rounded-2xl py-3 transition-transform active:scale-95"
                style={{
                  background: active ? `color-mix(in srgb, var(--${c.color}) 18%, transparent)` : 'var(--surface-card)',
                  outline: active ? `2px solid var(--${c.color})` : 'none',
                  outlineOffset: -2,
                }}
              >
                <span className="text-[20px] leading-none">{c.icon}</span>
                <span className="px-1 text-center text-[10.5px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                  {c.name}
                </span>
              </button>
            )
          })}
        </div>

        <label className="mb-1 block text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Date
        </label>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="mb-4 w-full rounded-2xl px-4 py-3 text-[15px] outline-none"
          style={{ background: 'var(--surface-card)', color: 'var(--text-primary)' }}
        />

        <label className="mb-1 block text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          What was it for? <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Lunch with the team"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-5 w-full rounded-2xl px-4 py-3 text-[15px] outline-none"
          style={{ background: 'var(--surface-card)', color: 'var(--text-primary)' }}
        />

        <div className="flex gap-3">
          {editing && onDelete && (
            <button
              onClick={onDelete}
              className="rounded-2xl px-5 py-3.5 text-[15px] font-semibold"
              style={{ background: 'color-mix(in srgb, var(--status-critical) 14%, transparent)', color: 'var(--status-critical)' }}
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 rounded-2xl py-3.5 text-[15px] font-semibold text-white transition-opacity"
            style={{ background: 'var(--series-1)', opacity: canSave ? 1 : 0.5 }}
          >
            {editing ? 'Save changes' : 'Add expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
