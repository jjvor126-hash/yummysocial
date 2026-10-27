import { Link } from 'react-router-dom'
import { Icon } from './Icon'

type PlaceholderProps = {
  title: string
  description: string
  icon: string
  phase: string
  backTo?: string
  cta?: { label: string; to: string }
  standalone?: boolean
}

export function Placeholder({
  title,
  description,
  icon,
  phase,
  backTo,
  cta,
  standalone = false,
}: PlaceholderProps) {
  return (
    <div
      className={`flex flex-col ${
        standalone ? 'min-h-dvh' : 'min-h-[calc(100dvh-5rem)]'
      }`}
    >
      {backTo ? (
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-surface/90 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
          <Link
            to={backTo}
            aria-label="Volver"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="arrow_back" />
          </Link>
          <h1 className="text-base font-bold">{title}</h1>
        </header>
      ) : null}

      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-20 pt-10 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary dark:bg-white/5">
          <Icon name={icon} className="text-[32px]" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted dark:text-gray-400">
          {description}
        </p>
        <span className="mt-6 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
          {phase}
        </span>
        {cta ? (
          <Link
            to={cta.to}
            className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
          >
            {cta.label}
          </Link>
        ) : null}
      </div>
    </div>
  )
}
