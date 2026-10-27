type IconProps = {
  name: string
  className?: string
  filled?: boolean
}

export function Icon({ name, className = '', filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined max-w-[1em] overflow-hidden leading-none ${
        filled ? 'icon-filled' : ''
      } ${className}`}
    >
      {name}
    </span>
  )
}
