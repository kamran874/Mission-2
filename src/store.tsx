import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as api from './lib/acApi'
import { loadActiveDeviceId, loadDevices, makeDeviceId, saveActiveDeviceId, saveDevices } from './lib/storage'
import type { AcStatus, ConnectionState, Device, FanSpeed, Mode, SwingType } from './types'

const POLL_INTERVAL_MS = 4000

interface AcStore {
  devices: Device[]
  activeDevice: Device | null
  status: AcStatus | null
  connection: ConnectionState
  error: string | null
  busy: boolean
  addDevice: (name: string, host: string) => Device
  updateDevice: (id: string, patch: Partial<Omit<Device, 'id'>>) => void
  removeDevice: (id: string) => void
  selectDevice: (id: string) => void
  refresh: () => Promise<void>
  power: (set: 'on' | 'off' | 'toggle') => Promise<void>
  temp: (value: number | 'up' | 'down') => Promise<void>
  mode: (mode: Mode) => Promise<void>
  fan: (fan: FanSpeed) => Promise<void>
  turbo: (set: 'on' | 'off' | 'toggle') => Promise<void>
  sleepMode: (set: 'on' | 'off' | 'toggle') => Promise<void>
  swing: (type: SwingType) => Promise<void>
  light: () => Promise<void>
  stageTimer: (action: 'on' | 'off', minutes: number) => Promise<void>
  startTimer: () => Promise<void>
  cancelTimer: () => Promise<void>
}

const Ctx = createContext<AcStore | null>(null)

export function AcProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(() => loadDevices())
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveDeviceId())
  const [status, setStatus] = useState<AcStatus | null>(null)
  const [connection, setConnection] = useState<ConnectionState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeDevice = devices.find((d) => d.id === activeId) ?? null

  const persistDevices = useCallback((next: Device[]) => {
    setDevices(next)
    saveDevices(next)
  }, [])

  const addDevice = useCallback(
    (name: string, host: string) => {
      const device: Device = { id: makeDeviceId(), name: name.trim() || 'AC', host: host.trim() }
      const next = [...devices, device]
      persistDevices(next)
      setActiveId(device.id)
      saveActiveDeviceId(device.id)
      return device
    },
    [devices, persistDevices],
  )

  const updateDevice = useCallback(
    (id: string, patch: Partial<Omit<Device, 'id'>>) => {
      persistDevices(devices.map((d) => (d.id === id ? { ...d, ...patch } : d)))
    },
    [devices, persistDevices],
  )

  const removeDevice = useCallback(
    (id: string) => {
      const next = devices.filter((d) => d.id !== id)
      persistDevices(next)
      if (activeId === id) {
        const fallback = next[0]?.id ?? null
        setActiveId(fallback)
        if (fallback) saveActiveDeviceId(fallback)
      }
    },
    [devices, persistDevices, activeId],
  )

  const selectDevice = useCallback((id: string) => {
    setActiveId(id)
    saveActiveDeviceId(id)
    setStatus(null)
    setConnection('idle')
  }, [])

  const refresh = useCallback(async () => {
    if (!activeDevice) return
    setConnection((c) => (c === 'online' ? c : 'connecting'))
    try {
      const next = await api.fetchStatus(activeDevice.host)
      setStatus(next)
      setConnection('online')
      setError(null)
    } catch (err) {
      setConnection('offline')
      setError(err instanceof Error ? err.message : 'Could not reach the device')
    }
  }, [activeDevice])

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (!activeDevice) {
      setStatus(null)
      setConnection('idle')
      return
    }
    void refresh()
    pollRef.current = setInterval(() => void refresh(), POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDevice?.id])

  const runAction = useCallback(
    async (action: () => Promise<void>) => {
      if (!activeDevice) return
      setBusy(true)
      try {
        await action()
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Command failed')
        setConnection('offline')
      } finally {
        setBusy(false)
      }
    },
    [activeDevice, refresh],
  )

  const value: AcStore = {
    devices,
    activeDevice,
    status,
    connection,
    error,
    busy,
    addDevice,
    updateDevice,
    removeDevice,
    selectDevice,
    refresh,
    power: (set) => runAction(() => api.setPower(activeDevice!.host, set)),
    temp: (v) => runAction(() => api.setTemp(activeDevice!.host, v)),
    mode: (m) => runAction(() => api.setMode(activeDevice!.host, m)),
    fan: (f) => runAction(() => api.setFan(activeDevice!.host, f)),
    turbo: (set) => runAction(() => api.setTurbo(activeDevice!.host, set)),
    sleepMode: (set) => runAction(() => api.setSleep(activeDevice!.host, set)),
    swing: (type) => runAction(() => api.setSwing(activeDevice!.host, type)),
    light: () => runAction(() => api.toggleLight(activeDevice!.host)),
    stageTimer: (action, minutes) => runAction(() => api.stageTimer(activeDevice!.host, action, minutes)),
    startTimer: () => runAction(() => api.startTimer(activeDevice!.host)),
    cancelTimer: () => runAction(() => api.cancelTimer(activeDevice!.host)),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAc(): AcStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAc must be used within AcProvider')
  return ctx
}
