export type Tab = 'today' | 'history' | 'reports' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '🏠' },
  { id: 'history', label: 'History', icon: '📅' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur"
      style={{
        borderColor: 'var(--border-hairline)',
        background: 'color-mix(in srgb, var(--surface-card) 92%, transparent)',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-opacity"
              style={{ opacity: isActive ? 1 : 0.55 }}
            >
              <span className="text-[20px] leading-none">{tab.icon}</span>
              <span
                className="text-[11px] font-medium leading-none"
                style={{ color: isActive ? 'var(--series-1)' : 'var(--text-secondary)' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
