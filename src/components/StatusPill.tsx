import type { ConnectionState } from '../types'

const LABEL: Record<ConnectionState, string> = {
  idle: 'No device',
  connecting: 'Connecting…',
  online: 'Connected',
  offline: 'Offline',
}

const DOT: Record<ConnectionState, string> = {
  idle: 'bg-white/30',
  connecting: 'bg-amber-400 animate-pulse',
  online: 'bg-emerald-400',
  offline: 'bg-rose-500',
}

export function StatusPill({ state, deviceName }: { state: ConnectionState; deviceName?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/80">
      <span className={`h-2 w-2 rounded-full ${DOT[state]}`} />
      <span>{deviceName ? `${deviceName} · ${LABEL[state]}` : LABEL[state]}</span>
    </div>
  )
}
