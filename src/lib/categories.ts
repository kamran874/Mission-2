import type { Category } from '../types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: 'series-1', builtIn: true },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: 'series-3', builtIn: true },
  { id: 'transport', name: 'Transport', icon: '🚗', color: 'series-2', builtIn: true },
  { id: 'bills', name: 'Bills & Utilities', icon: '🧾', color: 'series-7', builtIn: true },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'series-5', builtIn: true },
  { id: 'health', name: 'Health', icon: '💊', color: 'series-8', builtIn: true },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'series-4', builtIn: true },
  { id: 'other', name: 'Other', icon: '📦', color: 'series-6', builtIn: true },
]
