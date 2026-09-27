import { useState } from 'react'
import { todayISO, formatLong } from '../lib/date'
import { useLedger } from '../store'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'CAD', 'AUD']

export function Onboarding() {
  const { updateSettings } = useLedger()
  const [startDate, setStartDate] = useState(todayISO())
  const [currency, setCurrency] = useState('USD')
  const [reminderTime, setReminderTime] = useState('23:00')

  function handleStart() {
    updateSettings({ onboarded: true, startDate, currency, reminderTime, reminderEnabled: true })
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-6 pb-10" style={{ paddingTop: 'calc(3rem + var(--safe-top))' }}>
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: 'var(--series-1)' }}
        >
          💰
        </div>
        <h1 className="text-[24px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Welcome to Ledger
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
          Log your spending each night, label what it was for, and see exactly where your money goes — weekly, bi-weekly, and monthly.
        </p>
      </div>

      <div className="mb-5 rounded-2xl p-4" style={{ background: 'var(--surface-card)' }}>
        <label className="mb-1 block text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Start tracking from
        </label>
        <input
          type="date"
          value={startDate}
          max={todayISO()}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-[15px] outline-none"
          style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}
        />
        <p className="mt-2 text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
          {formatLong(startDate)} — you can log expenses from this date onward.
        </p>
      </div>

      <div className="mb-5 rounded-2xl p-4" style={{ background: 'var(--surface-card)' }}>
        <label className="mb-2 block text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Currency
        </label>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
              style={{
                background: c === currency ? 'var(--series-1)' : 'var(--surface-page)',
                color: c === currency ? 'white' : 'var(--text-secondary)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-2xl p-4" style={{ background: 'var(--surface-card)' }}>
        <label className="mb-1 block text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Nightly reminder time
        </label>
        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-[15px] outline-none"
          style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}
        />
        <p className="mt-2 text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
          We'll nudge you to log the day's expenses around this time. You can fine-tune this later in Settings.
        </p>
      </div>

      <button
        onClick={handleStart}
        className="mt-auto rounded-2xl py-4 text-[16px] font-semibold text-white"
        style={{ background: 'var(--series-1)' }}
      >
        Start tracking
      </button>
    </div>
  )
}
