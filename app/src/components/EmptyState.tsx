import type { ReactNode } from 'react'
import { Icon } from './Icon'

type EmptyStateProps = {
  icon: string
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-10 text-center dark:border-white/10 dark:bg-white/5">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-primary/10">
        <Icon name={icon} className="text-[28px]" />
      </span>
      <p className="text-sm font-bold">{title}</p>
      <p className="max-w-[260px] text-xs leading-relaxed text-muted dark:text-gray-400">
        {description}
      </p>
      {action}
    </div>
  )
}
