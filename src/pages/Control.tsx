import type { FanSpeed, Mode } from '../types'
import { Segmented } from '../components/Segmented'
import { StatusPill } from '../components/StatusPill'
import { useAc } from '../store'

const MODES: { value: Mode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'cool', label: 'Cool' },
  { value: 'dry', label: 'Dry' },
  { value: 'heat', label: 'Heat' },
  { value: 'fan', label: 'Fan' },
]

const FAN_SPEEDS: { value: FanSpeed; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Med' },
  { value: 'high', label: 'High' },
]

export function Control() {
  const ac = useAc()
  const { activeDevice, status, connection, busy, error } = ac

  if (!activeDevice) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white/60">
        <div className="text-4xl">❄️</div>
        <p>No AC added yet.</p>
        <p className="text-sm">Go to the Devices tab to add your AC's address on your home Wi-Fi.</p>
      </div>
    )
  }

  const disabled = busy || connection === 'offline' || connection === 'idle'

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{activeDevice.name}</h1>
        <StatusPill state={connection} />
      </div>

      {error && connection === 'offline' && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4 rounded-3xl bg-[color:var(--color-surface)] p-6">
        <button
          onClick={() => void ac.power('toggle')}
          disabled={busy || connection === 'idle'}
          className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl transition-colors disabled:opacity-40 ${
            status?.power ? 'bg-[color:var(--color-brand)]' : 'bg-white/10'
          }`}
        >
          ⏻
        </button>
        <div className="flex items-center gap-6">
          <button
            disabled={disabled}
            onClick={() => void ac.temp('down')}
            className="h-11 w-11 rounded-full bg-white/10 text-xl disabled:opacity-40"
          >
            −
          </button>
          <div className="text-center">
            <div className="text-5xl font-semibold tabular-nums">{status?.targetTemp ?? '--'}°</div>
            {status?.roomTemp !== undefined && (
              <div className="text-xs text-white/50">Room {status.roomTemp.toFixed(1)}°</div>
            )}
          </div>
          <button
            disabled={disabled}
            onClick={() => void ac.temp('up')}
            className="h-11 w-11 rounded-full bg-white/10 text-xl disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-white/60">Mode</h2>
        <Segmented options={MODES} value={status?.mode} onChange={(m) => void ac.mode(m)} disabled={disabled} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-white/60">Fan speed</h2>
        <Segmented options={FAN_SPEEDS} value={status?.fan} onChange={(f) => void ac.fan(f)} disabled={disabled} />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <ToggleTile label="Turbo" active={!!status?.turbo} disabled={disabled} onClick={() => void ac.turbo('toggle')} />
        <ToggleTile label="Sleep" active={!!status?.sleep} disabled={disabled} onClick={() => void ac.sleepMode('toggle')} />
        <ToggleTile label="Swing" active={!!status?.hSwing} disabled={disabled} onClick={() => void ac.swing('v')} />
        <ToggleTile label="Panel light" active={false} disabled={disabled} onClick={() => void ac.light()} />
      </section>

      {(status?.watts !== undefined || status?.volts !== undefined) && (
        <section className="grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-3 text-center text-xs text-white/60">
          <div>
            <div className="text-base font-semibold text-white">{status?.watts ?? '--'}</div>
            Watts
          </div>
          <div>
            <div className="text-base font-semibold text-white">{status?.volts ?? '--'}</div>
            Volts
          </div>
          <div>
            <div className="text-base font-semibold text-white">{status?.amps ?? '--'}</div>
            Amps
          </div>
        </section>
      )}
    </div>
  )
}

function ToggleTile({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-40 ${
        active
          ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand)]/20 text-white'
          : 'border-white/10 bg-white/5 text-white/70'
      }`}
    >
      {label}
    </button>
  )
}
