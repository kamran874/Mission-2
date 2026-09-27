import type { AcStatus, FanSpeed, Mode, SwingType } from '../types'

export class AcApiError extends Error {}

function normalizeHost(host: string): string {
  const trimmed = host.trim().replace(/\/+$/, '')
  if (!trimmed) throw new AcApiError('No device address configured')
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
}

async function request(host: string, path: string, timeoutMs = 5000): Promise<Response> {
  const base = normalizeHost(host)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${base}${path}`, { signal: controller.signal, cache: 'no-store' })
    if (!res.ok) throw new AcApiError(`Device responded with ${res.status}`)
    return res
  } catch (err) {
    if (err instanceof AcApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AcApiError('Timed out reaching the device')
    }
    throw new AcApiError('Could not reach the device on this network')
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchStatus(host: string): Promise<AcStatus> {
  const res = await request(host, '/api/status')
  return res.json()
}

export async function setPower(host: string, set: 'on' | 'off' | 'toggle'): Promise<void> {
  await request(host, `/api/power?set=${set}`)
}

export async function setTemp(host: string, value: number | 'up' | 'down'): Promise<void> {
  await request(host, `/api/temp?set=${value}`)
}

export async function setMode(host: string, mode: Mode): Promise<void> {
  await request(host, `/api/mode?set=${mode}`)
}

export async function setFan(host: string, fan: FanSpeed): Promise<void> {
  await request(host, `/api/fan?set=${fan}`)
}

export async function setTurbo(host: string, set: 'on' | 'off' | 'toggle'): Promise<void> {
  await request(host, `/api/turbo?set=${set}`)
}

export async function setSleep(host: string, set: 'on' | 'off' | 'toggle'): Promise<void> {
  await request(host, `/api/sleep?set=${set}`)
}

export async function setSwing(host: string, type: SwingType, set: 'toggle' = 'toggle'): Promise<void> {
  await request(host, `/api/swing?type=${type}&set=${set}`)
}

export async function toggleLight(host: string): Promise<void> {
  await request(host, '/api/light')
}

export async function stageTimer(host: string, action: 'on' | 'off', minutes: number): Promise<void> {
  await request(host, `/api/timer?action=${action}&minutes=${minutes}`)
}

export async function startTimer(host: string): Promise<void> {
  await request(host, '/api/timer?start=1')
}

export async function cancelTimer(host: string): Promise<void> {
  await request(host, '/api/timer?cancel=1')
}
