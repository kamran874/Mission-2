export type SeriesToken =
  | 'series-1'
  | 'series-2'
  | 'series-3'
  | 'series-4'
  | 'series-5'
  | 'series-6'
  | 'series-7'
  | 'series-8'

export interface Category {
  id: string
  name: string
  icon: string
  color: SeriesToken
  builtIn?: boolean
}

export interface Expense {
  id: string
  date: string // YYYY-MM-DD
  amount: number
  categoryId: string
  note: string
  createdAt: number
}

export type ReportPeriod = 'weekly' | 'biweekly' | 'monthly'

export interface Settings {
  onboarded: boolean
  startDate: string // YYYY-MM-DD — the day tracking begins
  currency: string
  reminderEnabled: boolean
  reminderTime: string // HH:MM, 24h
  lastReminderPromptAt?: number
}
