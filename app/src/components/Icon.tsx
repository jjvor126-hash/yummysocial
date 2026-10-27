type IconProps = {
  name: string
  className?: string
  filled?: boolean
}

export function Icon({ name, className = '', filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined leading-none ${filled ? 'icon-filled' : ''} ${className}`}
    >
      {name}
    </span>
  )
}
