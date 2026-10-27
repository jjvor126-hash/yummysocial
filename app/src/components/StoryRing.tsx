import { Icon } from './Icon'

type StoryRingProps = {
  avatar: string
  label: string
  variant?: 'gradient' | 'seen' | 'empty'
  withPlus?: boolean
  className?: string
}

const ringClass: Record<NonNullable<StoryRingProps['variant']>, string> = {
  gradient: 'bg-gradient-to-tr from-primary via-orange-300 to-yellow-200 p-[2px]',
  seen: 'bg-line p-[2px] dark:bg-white/20',
  empty: 'border-2 border-dashed border-primary/60 p-[3px]',
}

export function StoryRing({
  avatar,
  label,
  variant = 'gradient',
  withPlus = false,
  className = '',
}: StoryRingProps) {
  return (
    <span className={`flex w-[68px] shrink-0 flex-col items-center gap-1.5 ${className}`}>
      <span className="relative">
        <span className={`block rounded-full ${ringClass[variant]}`}>
          <span className="block rounded-full border-2 border-surface bg-surface p-[2px] dark:border-surface-dark dark:bg-surface-dark">
            <img
              src={avatar}
              alt=""
              className="size-16 rounded-full object-cover"
              loading="lazy"
            />
          </span>
        </span>
        {withPlus ? (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border-2 border-surface bg-primary text-white shadow-sm dark:border-surface-dark">
            <Icon name="add" className="text-[15px]" />
          </span>
        ) : null}
      </span>
      <span className="w-full truncate text-center text-[11px] font-medium">{label}</span>
    </span>
  )
}
