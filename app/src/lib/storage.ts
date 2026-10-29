import type { StateStorage } from 'zustand/middleware'

export const STORAGE_ERROR_EVENT = 'yummysocial:storage-error'

export type StorageErrorDetail = {
  operation: 'read' | 'write' | 'remove'
  message: string
}

const QUOTA_MESSAGE =
  'No se pudo guardar en este dispositivo: el almacenamiento local está lleno. Borra alguna foto o restablece la demo.'

let lastNoticeAt = 0

export function isQuotaError(error: unknown): boolean {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )
  }

  return error instanceof Error && /quota|storage.*full/i.test(error.message)
}

/** Avisa a la interfaz cuando localStorage falla (por ejemplo, por falta de cuota). */
export function reportStorageError(error: unknown, operation: StorageErrorDetail['operation']) {
  if (typeof window === 'undefined') return

  const now = Date.now()
  if (now - lastNoticeAt < 8_000) return
  lastNoticeAt = now

  window.dispatchEvent(
    new CustomEvent<StorageErrorDetail>(STORAGE_ERROR_EVENT, {
      detail: {
        operation,
        message: isQuotaError(error)
          ? QUOTA_MESSAGE
          : 'No se pudo guardar en este dispositivo. Revisa el almacenamiento del navegador.',
      },
    }),
  )
}

/**
 * Envoltorio de localStorage para el store persistido. Si el navegador rechaza una
 * escritura (cuota llena, modo privado), se avisa en pantalla y la app sigue funcionando
 * con los datos en memoria en lugar de romperse.
 */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch (error) {
      reportStorageError(error, 'read')
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch (error) {
      reportStorageError(error, 'write')
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch (error) {
      reportStorageError(error, 'remove')
    }
  },
}
