type SharePayload = {
  title: string
  text?: string
  path: string
}

export type ShareResult = 'shared' | 'copied' | 'cancelled'

/**
 * Comparte con la Web Share API y, si no está disponible, copia el enlace.
 */
export async function shareLink({ title, text, path }: SharePayload): Promise<ShareResult> {
  const url = `${window.location.origin}${path}`

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url })
      return 'shared'
    }
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'cancelled'
  }
}
