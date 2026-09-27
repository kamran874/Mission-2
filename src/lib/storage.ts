import type { Category, Expense, Settings } from '../types'
import { DEFAULT_CATEGORIES } from './categories'

const KEYS = {
  expenses: 'ledger:expenses',
  categories: 'ledger:categories',
  settings: 'ledger:settings',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  startDate: new Date().toISOString().slice(0, 10),
  currency: 'USD',
  reminderEnabled: false,
  reminderTime: '23:00',
}

export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) }
}

export function saveSettings(settings: Settings) {
  write(KEYS.settings, settings)
}

export function getCategories(): Category[] {
  return read<Category[]>(KEYS.categories, DEFAULT_CATEGORIES)
}

export function saveCategories(categories: Category[]) {
  write(KEYS.categories, categories)
}

export function getExpenses(): Expense[] {
  return read<Expense[]>(KEYS.expenses, [])
}

export function saveExpenses(expenses: Expense[]) {
  write(KEYS.expenses, expenses)
}

export function addExpense(expense: Expense) {
  const all = getExpenses()
  all.push(expense)
  saveExpenses(all)
  return all
}

export function updateExpense(id: string, patch: Partial<Expense>) {
  const all = getExpenses().map((e) => (e.id === id ? { ...e, ...patch } : e))
  saveExpenses(all)
  return all
}

export function deleteExpense(id: string) {
  const all = getExpenses().filter((e) => e.id !== id)
  saveExpenses(all)
  return all
}

export function exportAsJSON(): string {
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), settings: getSettings(), categories: getCategories(), expenses: getExpenses() },
    null,
    2,
  )
}

export function exportAsCSV(): string {
  const categories = getCategories()
  const nameFor = (id: string) => categories.find((c) => c.id === id)?.name ?? id
  const rows = [['date', 'category', 'amount', 'note']]
  for (const e of [...getExpenses()].sort((a, b) => a.date.localeCompare(b.date))) {
    rows.push([e.date, nameFor(e.categoryId), e.amount.toFixed(2), e.note.replace(/[\n,]/g, ' ')])
  }
  return rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
}
