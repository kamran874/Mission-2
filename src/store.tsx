import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Category, Expense, Settings } from './types'
import * as storage from './lib/storage'

interface LedgerContextValue {
  expenses: Expense[]
  categories: Category[]
  settings: Settings
  addExpense: (input: Omit<Expense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, patch: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  addCategory: (input: Omit<Category, 'id' | 'builtIn'>) => Category
  updateSettings: (patch: Partial<Settings>) => void
}

const LedgerContext = createContext<LedgerContextValue | null>(null)

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses())
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories())
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings())

  const addExpense = useCallback((input: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = { ...input, id: crypto.randomUUID(), createdAt: Date.now() }
    setExpenses(storage.addExpense(expense))
  }, [])

  const updateExpenseFn = useCallback((id: string, patch: Partial<Expense>) => {
    setExpenses(storage.updateExpense(id, patch))
  }, [])

  const deleteExpenseFn = useCallback((id: string) => {
    setExpenses(storage.deleteExpense(id))
  }, [])

  const addCategory = useCallback(
    (input: Omit<Category, 'id' | 'builtIn'>) => {
      const category: Category = { ...input, id: crypto.randomUUID() }
      const next = [...categories, category]
      setCategories(next)
      storage.saveCategories(next)
      return category
    },
    [categories],
  )

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch }
      setSettings(next)
      storage.saveSettings(next)
    },
    [settings],
  )

  const value = useMemo(
    () => ({
      expenses,
      categories,
      settings,
      addExpense,
      updateExpense: updateExpenseFn,
      deleteExpense: deleteExpenseFn,
      addCategory,
      updateSettings,
    }),
    [expenses, categories, settings, addExpense, updateExpenseFn, deleteExpenseFn, addCategory, updateSettings],
  )

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
}

export function useLedger(): LedgerContextValue {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider')
  return ctx
}
