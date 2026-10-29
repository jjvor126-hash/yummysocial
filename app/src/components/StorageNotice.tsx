import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { STORAGE_ERROR_EVENT } from '../lib/storage'
import type { StorageErrorDetail } from '../lib/storage'

export function StorageNotice() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    function handleStorageError(event: Event) {
      const detail = (event as CustomEvent<StorageErrorDetail>).detail
      setMessage(detail?.message ?? 'No se pudo guardar en este dispositivo.')
    }

    window.addEventListener(STORAGE_ERROR_EVENT, handleStorageError)
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, handleStorageError)
  }, [])

  if (!message) return null

  return (
    <div
      role="alert"
      className="fixed left-1/2 top-3 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-amber-900 shadow-lg dark:border-amber-400/40 dark:bg-[#3a2a12] dark:text-amber-100"
    >
      <Icon name="warning" className="mt-0.5 shrink-0 text-[20px]" />
      <p className="min-w-0 flex-1 text-xs font-semibold leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={() => setMessage(null)}
        aria-label="Cerrar aviso de almacenamiento"
        className="flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-amber-200/70 dark:hover:bg-white/10"
      >
        <Icon name="close" className="text-[16px]" />
      </button>
    </div>
  )
}
