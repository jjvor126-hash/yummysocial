import type { ReactNode } from 'react'
import { Icon } from './Icon'

type FilterChipProps = {
  active: boolean
  onClick: () => void
  children: ReactNode
  icon?: string
}

export function FilterChip({ active, onClick, children, icon }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm transition-colors active:scale-95 ${
        active
          ? 'bg-primary font-semibold text-white shadow-sm shadow-primary/30'
          : 'bg-white font-medium text-muted ring-1 ring-line hover:bg-black/5 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10 dark:hover:bg-white/10'
      }`}
    >
      {icon ? <Icon name={icon} className="text-[17px]" /> : null}
      <span>{children}</span>
    </button>
  )
}
