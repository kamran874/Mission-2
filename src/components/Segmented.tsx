interface Option<T extends string> {
  value: T
  label: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: Option<T>[]
  value: T | undefined
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
              active
                ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand)]/20 text-white'
                : 'border-white/10 bg-white/5 text-white/70'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
