import { useEffect, useState } from 'react'
import { LedgerProvider, useLedger } from './store'
import { BottomNav, type Tab } from './components/BottomNav'
import { Onboarding } from './pages/Onboarding'
import { Today } from './pages/Today'
import { History } from './pages/History'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { fireNotification, scheduleReminder } from './lib/reminders'

function AppShell() {
  const { settings } = useLedger()
  const [tab, setTab] = useState<Tab>('today')

  useEffect(() => {
    if (!settings.reminderEnabled) return
    const cancel = scheduleReminder(settings.reminderTime, () => {
      fireNotification('Log today\'s expenses', "It's that time — add what you spent today before you forget.")
    })
    return cancel
  }, [settings.reminderEnabled, settings.reminderTime])

  if (!settings.onboarded) return <Onboarding />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      {tab === 'today' && <Today />}
      {tab === 'history' && <History />}
      {tab === 'reports' && <Reports />}
      {tab === 'settings' && <Settings />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

function App() {
  return (
    <LedgerProvider>
      <AppShell />
    </LedgerProvider>
  )
}

export default App
