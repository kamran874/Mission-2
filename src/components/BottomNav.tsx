export type Page = 'control' | 'timer' | 'devices'

const ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'control', label: 'Control', icon: '❄️' },
  { id: 'timer', label: 'Timer', icon: '⏱' },
  { id: 'devices', label: 'Devices', icon: '⚙️' },
]

export function BottomNav({ page, onChange }: { page: Page; onChange: (p: Page) => void }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 border-t border-white/10 bg-[color:var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {ITEMS.map((item) => {
          const active = item.id === page
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                active ? 'text-[color:var(--color-brand)]' : 'text-white/50'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
