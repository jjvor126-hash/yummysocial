import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Icon } from './Icon'
import { readImageFile } from '../lib/image'
import { useAppStore, useCurrentUser } from '../store/useAppStore'

const AVATAR_OPTIONS = [
  '/img/detalle-de-receta-1-04.jpg',
  '/img/detalle-de-receta-1-05.jpg',
  '/img/feed-principal-de-recetas-05.jpg',
  '/img/tabla-de-clasificaci-n-chefs-1-08.jpg',
]

const fieldClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500'

const labelTextClass = 'ml-1 text-sm font-semibold text-ink dark:text-gray-200'

type EditProfileSheetProps = {
  open: boolean
  onClose: () => void
  onSaved: (message: string) => void
}

export function EditProfileSheet({ open, onClose, onSaved }: EditProfileSheetProps) {
  if (!open) return null
  return <EditProfileSheetContent onClose={onClose} onSaved={onSaved} />
}

function EditProfileSheetContent({
  onClose,
  onSaved,
}: Omit<EditProfileSheetProps, 'open'>) {
  const user = useCurrentUser()
  const updateProfile = useAppStore((state) => state.updateProfile)

  const [name, setName] = useState(user?.name ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [location, setLocation] = useState(user?.location ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
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
  }, [onClose])

  if (!user) return null

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setReading(true)
    setError(null)
    try {
      setAvatar(await readImageFile(file, { maxSize: 480, maxBytes: 90_000 }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la imagen.')
    } finally {
      setReading(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const cleanName = name.trim()
    const cleanUsername = username.trim().replace(/^@+/, '').replace(/\s+/g, '')

    if (!cleanName) {
      setError('Escribe tu nombre.')
      return
    }

    if (!cleanUsername) {
      setError('Escribe un nombre de usuario.')
      return
    }

    updateProfile({
      name: cleanName,
      username: cleanUsername,
      bio: bio.trim(),
      location: location.trim(),
      avatar: avatar || AVATAR_OPTIONS[3],
    })
    onSaved('Perfil actualizado')
    onClose()
  }

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
        aria-labelledby="edit-profile-title"
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface shadow-2xl dark:bg-surface-dark"
      >
        <div className="sticky top-0 z-10 bg-surface/95 px-4 pt-2 backdrop-blur dark:bg-surface-dark/95">
          <span className="mx-auto block h-1 w-10 rounded-full bg-line dark:bg-white/20" />
          <div className="flex items-center justify-between py-3">
            <h2 id="edit-profile-title" className="text-lg font-bold">
              Editar perfil
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-8 pt-2">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Cambiar foto de perfil"
              className="relative"
            >
              <span className="block rounded-full bg-gradient-to-tr from-primary to-yellow-300 p-[3px]">
                <img
                  src={avatar || AVATAR_OPTIONS[3]}
                  alt=""
                  className="size-24 rounded-full border-4 border-surface object-cover dark:border-surface-dark"
                />
              </span>
              <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-surface bg-primary text-white shadow-md dark:border-surface-dark">
                <Icon
                  name={reading ? 'sync' : 'photo_camera'}
                  className={`text-[16px] ${reading ? 'animate-spin' : ''}`}
                />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />

            <div className="flex items-center gap-2">
              {AVATAR_OPTIONS.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAvatar(option)}
                  aria-label={`Usar avatar de ejemplo ${index + 1}`}
                  aria-pressed={avatar === option}
                  className={`overflow-hidden rounded-full border-2 transition-colors ${
                    avatar === option
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={option} alt="" className="size-10 object-cover" />
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted dark:text-gray-400">
              Toca la foto para subir una imagen o elige una de ejemplo.
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
            >
              <Icon name="error" className="text-[16px]" />
              {error}
            </p>
          ) : null}

          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Nombre</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tu nombre"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Nombre de usuario</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted dark:text-gray-500">
                @
              </span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="tunombre"
                className={`${fieldClass} pl-8`}
              />
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Biografía</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Cuéntanos qué te gusta cocinar"
              rows={3}
              className={`${fieldClass} resize-none leading-relaxed`}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Ubicación</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 flex -translate-y-1/2 text-muted dark:text-gray-500">
                <Icon name="location_on" className="text-[18px]" />
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Ciudad"
                className={`${fieldClass} pl-10`}
              />
            </div>
          </label>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line bg-white text-sm font-bold text-ink transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
