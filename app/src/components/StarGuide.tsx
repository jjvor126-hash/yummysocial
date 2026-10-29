import { useEffect } from 'react'
import { Icon } from './Icon'
import { STAR_REWARD_LIST } from '../lib/stars'

export function StarGuide() {
  return (
    <ul className="flex flex-col gap-2">
      {STAR_REWARD_LIST.map((reward) => (
        <li
          key={reward.key}
          className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-white/5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name={reward.icon} className="text-[18px]" />
          </span>
          <span className="flex-1 text-sm font-medium">{reward.label}</span>
          <span className="shrink-0 rounded-full bg-primary-soft px-2 py-1 text-[11px] font-bold text-primary dark:bg-primary/10">
            +{reward.stars} ★
          </span>
        </li>
      ))}
    </ul>
  )
}

export function StarGuideSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="star-guide-title"
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface px-4 pb-8 shadow-2xl dark:bg-surface-dark"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-surface/95 py-3 backdrop-blur dark:bg-surface-dark/95">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="star" filled className="text-[20px]" />
            </span>
            <h2 id="star-guide-title" className="text-lg font-bold">
              Cómo ganar estrellas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="close" />
          </button>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-muted dark:text-gray-400">
          Tus estrellas suben tu nivel y tu posición en la clasificación de chefs. Cada acción suma:
        </p>

        <StarGuide />

        <p className="mt-4 rounded-xl bg-white/70 px-3 py-2 text-xs leading-relaxed text-muted dark:bg-white/5 dark:text-gray-400">
          Con más nivel abres los secretos de las recetas. Yummy+ abre todos los secretos al
          instante, sin esperar a subir de nivel.
        </p>
      </div>
    </div>
  )
}
