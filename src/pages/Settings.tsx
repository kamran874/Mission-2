import { useState, type ReactNode } from 'react'
import { useLedger } from '../store'
import { exportAsCSV, exportAsJSON } from '../lib/storage'
import { notificationsSupported, requestNotificationPermission } from '../lib/reminders'
import { formatLong } from '../lib/date'
import type { Category, SeriesToken } from '../types'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'CAD', 'AUD']
const SWATCHES: SeriesToken[] = ['series-1', 'series-2', 'series-3', 'series-4', 'series-5', 'series-6', 'series-7', 'series-8']

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--surface-card)' }}>
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[14.5px]" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative h-7 w-12 rounded-full transition-colors"
      style={{ background: on ? 'var(--series-1)' : 'var(--gridline)' }}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

export function Settings() {
  const { settings, updateSettings, categories, addCategory, expenses } = useLedger()
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationsSupported() ? Notification.permission : 'denied',
  )
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('🏷️')
  const [newCatColor, setNewCatColor] = useState<SeriesToken>('series-1')
  const [showInstall, setShowInstall] = useState(false)

  async function handleEnableReminders(on: boolean) {
    if (on) {
      const perm = await requestNotificationPermission()
      setPermission(perm)
      updateSettings({ reminderEnabled: perm === 'granted' })
    } else {
      updateSettings({ reminderEnabled: false })
    }
  }

  function handleAddCategory() {
    if (!newCatName.trim()) return
    addCategory({ name: newCatName.trim(), icon: newCatIcon || '🏷️', color: newCatColor })
    setNewCatName('')
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28" style={{ paddingTop: 'calc(1.5rem + var(--safe-top))' }}>
      <h1 className="mb-4 text-[24px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>

      <Section title="Nightly reminder">
        <Row label="Remind me to log expenses">
          <Toggle on={settings.reminderEnabled && permission === 'granted'} onChange={handleEnableReminders} />
        </Row>
        <Row label="Reminder time">
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(e) => updateSettings({ reminderTime: e.target.value })}
            className="rounded-lg px-2 py-1 text-[14px] outline-none"
            style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}
          />
        </Row>
        {permission === 'denied' && (
          <p className="mt-1 text-[12.5px]" style={{ color: 'var(--status-critical)' }}>
            Notifications are blocked for this app in iOS Settings → Notifications.
          </p>
        )}
        <p className="mt-2 text-[12.5px] leading-snug" style={{ color: 'var(--text-muted)' }}>
          iOS pauses background timers when the app isn't open, so this reminder fires reliably only while
          Ledger is open. For a guaranteed nightly ping, add an iPhone <b>Shortcuts</b> automation: Automation
          → Time of Day → {settings.reminderTime} → Open App → Ledger, with "Ask Before Running" off.
        </p>
      </Section>

      <Section title="Currency">
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => updateSettings({ currency: c })}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
              style={{
                background: c === settings.currency ? 'var(--series-1)' : 'var(--surface-page)',
                color: c === settings.currency ? 'white' : 'var(--text-secondary)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Categories">
        <div className="mb-3 flex flex-col gap-1.5">
          {categories.map((c: Category) => (
            <div key={c.id} className="flex items-center gap-2 py-1">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[14px]"
                style={{ background: `color-mix(in srgb, var(--${c.color}) 18%, transparent)` }}
              >
                {c.icon}
              </span>
              <span className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
                {c.name}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newCatIcon}
            onChange={(e) => setNewCatIcon(e.target.value.slice(0, 2))}
            className="w-11 rounded-xl px-2 py-2 text-center text-[16px] outline-none"
            style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}
          />
          <input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-xl px-3 py-2 text-[14px] outline-none"
            style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="my-2 flex gap-1.5">
          {SWATCHES.map((s) => (
            <button
              key={s}
              onClick={() => setNewCatColor(s)}
              className="h-6 w-6 rounded-full"
              style={{ background: `var(--${s})`, outline: newCatColor === s ? '2px solid var(--text-primary)' : 'none', outlineOffset: 2 }}
            />
          ))}
        </div>
        <button
          onClick={handleAddCategory}
          className="w-full rounded-xl py-2.5 text-[14px] font-semibold"
          style={{ background: 'var(--surface-page)', color: 'var(--series-1)' }}
        >
          Add category
        </button>
      </Section>

      <Section title="Your data">
        <Row label="Tracking since">
          <span className="text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
            {formatLong(settings.startDate)}
          </span>
        </Row>
        <Row label="Total entries">
          <span className="text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
            {expenses.length}
          </span>
        </Row>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => download(`ledger-export-${settings.startDate}.json`, exportAsJSON(), 'application/json')}
            className="flex-1 rounded-xl py-2.5 text-[13.5px] font-semibold"
            style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}
          >
            Export JSON
          </button>
          <button
            onClick={() => download(`ledger-export-${settings.startDate}.csv`, exportAsCSV(), 'text/csv')}
            className="flex-1 rounded-xl py-2.5 text-[13.5px] font-semibold"
            style={{ background: 'var(--surface-page)', color: 'var(--text-primary)' }}
          >
            Export CSV
          </button>
        </div>
        <p className="mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Export and share via the iOS share sheet to review your own weekly, bi-weekly, or monthly report anywhere — Mail, Notes, Files, and more.
        </p>
      </Section>

      <Section title="Install on iPhone">
        <button
          onClick={() => setShowInstall((v) => !v)}
          className="text-[13.5px] font-medium"
          style={{ color: 'var(--series-1)' }}
        >
          {showInstall ? 'Hide steps' : 'How do I add this to my Home Screen?'}
        </button>
        {showInstall && (
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            <li>Open this app in Safari on your iPhone.</li>
            <li>
              Tap the <b>Share</b> icon in the toolbar.
            </li>
            <li>
              Scroll down and tap <b>Add to Home Screen</b>.
            </li>
            <li>Tap Add — Ledger now opens full-screen like a regular app, and works offline.</li>
          </ol>
        )}
      </Section>
    </div>
  )
}
