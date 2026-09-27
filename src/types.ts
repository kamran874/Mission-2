export type Mode = 'auto' | 'cool' | 'dry' | 'heat' | 'fan'
export type FanSpeed = 'auto' | 'low' | 'medium' | 'high'
export type SwingType = 'v' | 'h'

export interface AcStatus {
  power: boolean
  targetTemp: number
  mode: Mode
  fan: FanSpeed
  turbo: boolean
  sleep: boolean
  hSwing: boolean
  vSwing?: boolean
  roomTemp?: number
  volts?: number
  amps?: number
  watts?: number
  timerActive?: boolean
  timerAction?: 'on' | 'off'
  timerRemainingSeconds?: number
}

export interface Device {
  id: string
  name: string
  host: string
}

export type ConnectionState = 'idle' | 'connecting' | 'online' | 'offline'
