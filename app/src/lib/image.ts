const DEFAULT_MAX_SIZE = 1200
const DEFAULT_MAX_BYTES = 420_000
const DEFAULT_QUALITY = 0.82

export type ImageReadOptions = {
  /** Lado mayor de la imagen resultante. */
  maxSize?: number
  /** Calidad JPEG inicial (0–1). */
  quality?: number
  /** Tamaño máximo aproximado del data URL, en bytes. */
  maxBytes?: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo procesar la imagen.'))
    image.src = src
  })
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}

/** Tamaño aproximado en bytes de un data URL en base64. */
export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',')
  if (comma < 0) return dataUrl.length
  const payload = dataUrl.length - comma - 1
  return Math.ceil((payload * 3) / 4)
}

function draw(
  image: HTMLImageElement,
  maxSize: number,
  quality: number,
): string | null {
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return null

  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Lee una imagen local y la reduce a JPEG para que quepa en localStorage.
 * Si el resultado supera `maxBytes`, baja la calidad y después el tamaño
 * en varios intentos para no agotar la cuota del navegador.
 */
export async function readImageFile(
  file: File,
  options: number | ImageReadOptions = {},
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen.')
  }

  const config: ImageReadOptions =
    typeof options === 'number' ? { maxSize: options } : options

  const maxSize = config.maxSize ?? DEFAULT_MAX_SIZE
  const maxBytes = config.maxBytes ?? DEFAULT_MAX_BYTES
  const initialQuality = config.quality ?? DEFAULT_QUALITY

  const dataUrl = await readAsDataUrl(file)
  const image = await loadImage(dataUrl)

  let targetSize = maxSize
  let quality = initialQuality
  let result = draw(image, targetSize, quality)

  if (!result) return dataUrl

  for (let attempt = 0; attempt < 10 && dataUrlBytes(result) > maxBytes; attempt += 1) {
    if (quality > 0.55) {
      quality = Math.max(0.5, quality - 0.08)
    } else {
      targetSize = Math.max(320, Math.round(targetSize * 0.8))
      quality = 0.68
    }

    result = draw(image, targetSize, quality) ?? result
  }

  return result
}
