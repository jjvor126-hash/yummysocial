import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import { readImageFile } from '../lib/image'
import {
  clearStoryDraft,
  emptyStoryDraft,
  loadStoryDraft,
  saveStoryDraft,
} from '../lib/storyDraft'
import { useToast } from '../lib/useToast'

const EXAMPLE_IMAGES = [
  '/img/mi-perfil-con-historias-02.jpg',
  '/img/mi-perfil-con-historias-04.jpg',
  '/img/mi-perfil-con-historias-06.jpg',
  '/img/mi-perfil-con-historias-07.jpg',
  '/img/mi-perfil-con-historias-09.jpg',
  '/img/selector-de-media-historia-01.jpg',
]

export function StoryMediaPicker() {
  const navigate = useNavigate()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const [hasDraft, setHasDraft] = useState(() => Boolean(loadStoryDraft()))
  const { message: toast, showToast } = useToast()

  function startWithImage(image: string) {
    const previous = loadStoryDraft()
    const saved = saveStoryDraft({
      ...emptyStoryDraft,
      ...previous,
      image,
    })

    if (!saved) {
      showToast('La imagen es demasiado grande para este dispositivo')
      return
    }

    navigate('/stories/new/editor')
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setReading(true)
    try {
      const image = await readImageFile(file, 1440)
      startWithImage(image)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo procesar la imagen')
    } finally {
      setReading(false)
    }
  }

  function handleDiscardDraft() {
    clearStoryDraft()
    setHasDraft(false)
    showToast('Borrador descartado')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => navigate('/feed')}
          aria-label="Cerrar"
          className="flex size-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm transition-colors hover:bg-white dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        >
          <Icon name="close" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Nueva historia</h1>
        <span className="size-10" aria-hidden="true" />
      </header>

      <main className="flex flex-1 flex-col gap-6 px-6 pb-10 pt-2">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            ¿Qué vas a
            <br />
            <span className="text-primary">cocinar hoy?</span>
          </h2>
          <p className="text-sm text-muted dark:text-gray-400">
            Comparte tu receta favorita con la comunidad.
          </p>
        </div>

        {hasDraft ? (
          <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary-soft px-3 py-2.5 text-xs font-medium text-primary dark:border-primary/30 dark:bg-primary/10">
            <Icon name="history" className="text-[16px]" />
            <span className="flex-1">Tienes una historia sin publicar</span>
            <button
              type="button"
              onClick={() => navigate('/stories/new/editor')}
              className="font-bold underline underline-offset-2"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              aria-label="Descartar borrador"
              className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-primary/10"
            >
              <Icon name="close" className="text-[14px]" />
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <MediaButton
            title="Tomar foto"
            description="Usa la cámara de tu teléfono"
            icon="photo_camera"
            background="/img/selector-de-media-historia-01.jpg"
            disabled={reading}
            onClick={() => cameraRef.current?.click()}
          />
          <MediaButton
            title="Elegir de la galería"
            description="Sube una foto desde tu dispositivo"
            icon="photo_library"
            background="/img/selector-de-media-historia-02.jpg"
            disabled={reading}
            onClick={() => galleryRef.current?.click()}
          />
        </div>

        {reading ? (
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary">
            <Icon name="sync" className="animate-spin text-[14px]" />
            Procesando imagen…
          </p>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold text-muted dark:text-gray-400">
            O elige una foto de ejemplo
          </p>
          <div className="grid grid-cols-3 gap-2">
            {EXAMPLE_IMAGES.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => startWithImage(image)}
                aria-label="Usar foto de ejemplo"
                className="overflow-hidden rounded-xl border-2 border-transparent transition-transform active:scale-95"
              >
                <img
                  src={image}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </main>

      <footer className="px-8 pb-6 text-center text-[11px] leading-relaxed text-muted dark:text-gray-500">
        Al continuar, permites que YummySocial acceda a tu cámara y fotos para crear
        contenido.
      </footer>

      <Toast message={toast} />
    </div>
  )
}

function MediaButton({
  title,
  description,
  icon,
  background,
  disabled,
  onClick,
}: {
  title: string
  description: string
  icon: string
  background: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-white p-5 text-left shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 dark:border-white/10 dark:bg-card-dark"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-[0.08] dark:opacity-15"
        style={{ backgroundImage: `url(${background})` }}
      />
      <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon name={icon} className="text-[28px]" />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-base font-bold">{title}</span>
        <span className="block text-xs text-muted dark:text-gray-400">{description}</span>
      </span>
      <Icon
        name="chevron_right"
        className="relative text-muted transition-transform group-hover:translate-x-0.5 dark:text-gray-500"
      />
    </button>
  )
}
