import { useMemo, useState } from 'react'
import type { DayTotal } from '../lib/reports'
import { formatMoney } from '../lib/currency'
import { formatLong, todayISO } from '../lib/date'

function niceMax(value: number): number {
  if (value <= 0) return 10
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

function roundedTopBarPath(x: number, y: number, width: number, height: number, radius: number): string {
  if (height <= 0) return ''
  const r = Math.min(radius, width / 2, height)
  const bottom = y + height
  return `M${x},${bottom} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${bottom} Z`
}

export function DailyBarChart({
  data,
  currency,
  labelEvery = 1,
}: {
  data: DayTotal[]
  currency: string
  labelEvery?: number
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const chartH = 140
  const axisLabelH = 18
  const topPad = 12
  const plotH = chartH - topPad
  const barGap = data.length > 20 ? 2 : 4
  const unit = 100 / data.length
  const barWidthPct = Math.min(unit - barGap, unit * 0.62)

  const max = useMemo(() => niceMax(Math.max(...data.map((d) => d.amount), 0)), [data])
  const today = todayISO()

  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f))

  const active = selected !== null ? data[selected] : null

  return (
    <div>
      <svg
        viewBox={`0 0 100 ${chartH + axisLabelH}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: chartH + axisLabelH, overflow: 'visible' }}
      >
        {ticks.map((t, i) => {
          const y = topPad + plotH - (i / 2) * plotH
          return (
            <line
              key={t}
              x1={0}
              x2={100}
              y1={y}
              y2={y}
              stroke="var(--gridline)"
              strokeWidth={0.4}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}

        {data.map((d, i) => {
          const barW = barWidthPct
          const x = i * unit + (unit - barW) / 2
          const h = max > 0 ? (d.amount / max) * plotH : 0
          const y = topPad + plotH - h
          const isSelected = selected === i
          const isToday = d.date === today
          return (
            <g key={d.date} onClick={() => setSelected(isSelected ? null : i)} style={{ cursor: 'pointer' }}>
              <rect x={x} y={topPad} width={barW} height={plotH} fill="transparent" />
              {d.amount > 0 ? (
                <path
                  d={roundedTopBarPath(x, y, barW, h, 1)}
                  fill="var(--series-1)"
                  opacity={selected === null || isSelected ? 1 : 0.35}
                />
              ) : (
                <rect x={x} y={topPad + plotH - 0.6} width={barW} height={0.6} fill="var(--baseline)" />
              )}
              {isToday && (
                <circle cx={x + barW / 2} cy={chartH + 8} r={1.3} fill="var(--series-1)" />
              )}
            </g>
          )
        })}

        <line x1={0} x2={100} y1={topPad + plotH} y2={topPad + plotH} stroke="var(--baseline)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="mt-1 flex text-center" style={{ fontSize: 9, color: 'var(--text-muted)' }}>
        {data.map((d, i) => (
          <div key={d.date} style={{ width: `${unit}%` }}>
            {i % labelEvery === 0 || i === data.length - 1 ? new Date(d.date).getDate() : ''}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between text-[12px]" style={{ color: 'var(--text-muted)' }}>
        <span>Up to {formatMoney(max, currency)}/day</span>
        {active && (
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {formatLong(active.date)} · {formatMoney(active.amount, currency)}
          </span>
        )}
      </div>
    </div>
  )
}
