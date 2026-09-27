import type { Device } from '../types'

const DEVICES_KEY = 'ac-control:devices'
const ACTIVE_DEVICE_KEY = 'ac-control:active-device'

export function loadDevices(): Device[] {
  try {
    const raw = localStorage.getItem(DEVICES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDevices(devices: Device[]): void {
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices))
}

export function loadActiveDeviceId(): string | null {
  return localStorage.getItem(ACTIVE_DEVICE_KEY)
}

export function saveActiveDeviceId(id: string): void {
  localStorage.setItem(ACTIVE_DEVICE_KEY, id)
}

export function makeDeviceId(): string {
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
