import { useState } from 'react'
import { useAc } from '../store'

export function Timer() {
  const ac = useAc()
  const { activeDevice, status, busy, connection } = ac
  const [offMinutes, setOffMinutes] = useState(60)
  const [onMinutes, setOnMinutes] = useState(30)

  if (!activeDevice) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-white/60">
        Add your AC in the Devices tab first.
      </div>
    )
  }

  const disabled = busy || connection !== 'online'

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pb-6 pt-4">
      <h1 className="text-lg font-semibold">Timer</h1>

      {status?.timerActive && (
        <div className="rounded-2xl bg-[color:var(--color-brand)]/20 px-4 py-3 text-sm">
          Turning {status.timerAction} in{' '}
          <span className="font-semibold tabular-nums">
            {Math.floor((status.timerRemainingSeconds ?? 0) / 60)}m {(status.timerRemainingSeconds ?? 0) % 60}s
          </span>
        </div>
      )}

      <MinutesField label="Turn off after" minutes={offMinutes} onChange={setOffMinutes} disabled={disabled} />
      <MinutesField label="Turn on after" minutes={onMinutes} onChange={setOnMinutes} disabled={disabled} />

      <div className="flex gap-3">
        <button
          disabled={disabled}
          onClick={() => {
            void ac.stageTimer('off', offMinutes)
            void ac.stageTimer('on', onMinutes)
            void ac.startTimer()
          }}
          className="flex-1 rounded-xl bg-[color:var(--color-brand)] py-3 font-medium disabled:opacity-40"
        >
          Start timer
        </button>
        <button
          disabled={disabled}
          onClick={() => void ac.cancelTimer()}
          className="flex-1 rounded-xl bg-white/10 py-3 font-medium disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-white/40">
        Set only one field to schedule a single action, or set both to stage an off-then-on cycle.
      </p>
    </div>
  )
}

function MinutesField({
  label,
  minutes,
  onChange,
  disabled,
}: {
  label: string
  minutes: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[color:var(--color-surface)] px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-3">
        <button
          disabled={disabled}
          onClick={() => onChange(Math.max(0, minutes - 15))}
          className="h-8 w-8 rounded-full bg-white/10 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-16 text-center tabular-nums">{minutes} min</span>
        <button
          disabled={disabled}
          onClick={() => onChange(minutes + 15)}
          className="h-8 w-8 rounded-full bg-white/10 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
