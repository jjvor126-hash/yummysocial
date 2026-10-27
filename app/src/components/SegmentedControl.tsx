import { Icon } from './Icon'

type SegmentedOption<T extends string> = {
  value: T
  label: string
  icon?: string
}

type SegmentedControlProps<T extends string> = {
  label: string
  value: T
  options: ReadonlyArray<SegmentedOption<T>>
  onChange: (value: T) => void
  showIcons?: boolean
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  showIcons = true,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded-xl border border-line bg-white/70 p-1 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-xs font-bold transition-colors ${
              active
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'text-muted hover:bg-black/5 hover:text-ink dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            {showIcons && option.icon ? (
              <Icon
                name={option.icon}
                className="shrink-0 text-[16px]"
                filled={option.icon === 'star'}
              />
            ) : null}
            <span className="truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
