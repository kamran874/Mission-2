import type { Category } from '../types'

export function CategoryBadge({ category, size = 36 }: { category: Category; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, var(--${category.color}) 16%, transparent)`,
        fontSize: size * 0.5,
      }}
    >
      {category.icon}
    </div>
  )
}
