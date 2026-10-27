import { useId } from 'react'
import { Icon } from './Icon'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
}

export function SearchField({ value, onChange, placeholder, label }: SearchFieldProps) {
  const id = useId()

  return (
    <div className="flex h-12 items-center gap-2 rounded-xl bg-white pl-4 pr-2 shadow-sm ring-1 ring-line transition-shadow focus-within:ring-2 focus-within:ring-primary/40 dark:bg-white/5 dark:ring-white/10">
      <Icon name="search" className="shrink-0 text-[22px] text-primary" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-muted/80 dark:placeholder:text-gray-500"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      ) : null}
    </div>
  )
}
