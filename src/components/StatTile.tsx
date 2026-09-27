export function StatTile({
  label,
  value,
  delta,
  deltaGoodDirection = 'down',
}: {
  label: string
  value: string
  delta?: { percent: number } | null
  deltaGoodDirection?: 'up' | 'down'
}) {
  let deltaColor = 'var(--text-muted)'
  let deltaText = ''
  if (delta && Number.isFinite(delta.percent)) {
    const isUp = delta.percent >= 0
    const good = isUp ? deltaGoodDirection === 'up' : deltaGoodDirection === 'down'
    deltaColor = good ? 'var(--status-good)' : 'var(--status-critical)'
    deltaText = `${isUp ? '▲' : '▼'} ${Math.abs(delta.percent).toFixed(0)}%`
  }

  return (
    <div className="flex flex-1 flex-col gap-1 rounded-2xl p-4" style={{ background: 'var(--surface-card)' }}>
      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span className="text-[26px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
      {delta && (
        <span className="text-[12px] font-medium" style={{ color: deltaColor }}>
          {deltaText} <span style={{ color: 'var(--text-muted)' }}>vs last period</span>
        </span>
      )}
    </div>
  )
}
