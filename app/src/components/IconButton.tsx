import { Link } from 'react-router-dom'
import { Icon } from './Icon'

type IconButtonProps = {
  icon: string
  label: string
  to?: string
  onClick?: () => void
  badge?: boolean
}

const className =
  'relative flex size-10 items-center justify-center rounded-full bg-primary-soft text-ink transition-colors hover:bg-primary/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'

export function IconButton({ icon, label, to, onClick, badge = false }: IconButtonProps) {
  const content = (
    <>
      <Icon name={icon} className="text-[22px]" />
      {badge ? (
        <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-card-dark" />
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} aria-label={label} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {content}
    </button>
  )
}
