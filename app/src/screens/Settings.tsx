import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { toggleTheme } from '../lib/theme'
import { useAppStore, useCurrentUser } from '../store/useAppStore'

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function Settings() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const logout = useAppStore((state) => state.logout)
  const resetDemoData = useAppStore((state) => state.resetDemoData)
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  function handleThemeToggle() {
    setIsDark(toggleTheme() === 'dark')
  }

  function handleLogout() {
    logout()
    navigate('/welcome', { replace: true })
  }

  function handleReset() {
    const confirmed = window.confirm(
      '¿Restablecer los datos de demostración? Se perderán tus likes, comentarios y recetas guardadas.',
    )
    if (!confirmed) return
    resetDemoData()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-surface/90 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          aria-label="Volver al perfil"
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon name="arrow_back" />
        </button>
        <h1 className="flex-1 pr-10 text-center text-lg font-bold tracking-tight">Ajustes</h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 py-6">
        <section className="flex flex-col items-center">
          <div className="relative">
            <img
              src={user?.avatar ?? '/img/tabla-de-clasificaci-n-chefs-1-08.jpg'}
              alt=""
              className="size-24 rounded-full object-cover ring-4 ring-primary/20"
            />
            <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-surface bg-primary text-white dark:border-surface-dark">
              <Icon name="edit" className="text-[16px]" />
            </span>
          </div>
          <p className="mt-3 text-xl font-bold tracking-tight">{user?.name ?? 'Invitado'}</p>
          <p className="mt-0.5 text-sm text-muted dark:text-gray-400">
            @{user?.username ?? 'yummysocial'} · Cuenta de demostración
          </p>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-lg font-bold">Apariencia</h2>
          <div className="overflow-hidden rounded-2xl border border-line bg-white dark:border-white/10 dark:bg-card-dark">
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon name={isDark ? 'dark_mode' : 'light_mode'} className="text-xl" />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Modo oscuro</span>
                  <span className="text-xs text-muted dark:text-gray-400">
                    Cambia la apariencia de la app
                  </span>
                </div>
              </div>
              <Switch checked={isDark} onChange={handleThemeToggle} label="Modo oscuro" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-lg font-bold">Cuenta</h2>
          <div className="overflow-hidden rounded-2xl border border-line bg-white dark:border-white/10 dark:bg-card-dark">
            <div className="flex items-center gap-3 border-b border-line p-4 dark:border-white/10">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="person" className="text-xl" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">Nombre de usuario</p>
                <p className="truncate text-xs text-muted dark:text-gray-400">
                  @{user?.username ?? 'yummysocial'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-line p-4 dark:border-white/10">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="mail" className="text-xl" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">Correo electrónico</p>
                <p className="truncate text-xs text-muted dark:text-gray-400">
                  jesse@ejemplo.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="language" className="text-xl" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">Idioma</p>
                <p className="text-xs text-muted dark:text-gray-400">Español</p>
              </div>
              <Icon name="chevron_right" className="text-muted dark:text-gray-500" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-lg font-bold">Datos de demostración</h2>
          <div className="overflow-hidden rounded-2xl border border-line bg-white dark:border-white/10 dark:bg-card-dark">
            <button
              type="button"
              onClick={handleReset}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <Icon name="restart_alt" className="text-xl" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">Restablecer datos</p>
                <p className="text-xs text-muted dark:text-gray-400">
                  Vuelve al estado inicial de la demo
                </p>
              </div>
              <Icon name="chevron_right" className="text-muted dark:text-gray-500" />
            </button>
          </div>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-base font-bold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Icon name="logout" className="text-xl" />
          Cerrar sesión
        </button>

        <p className="pb-4 text-center text-xs text-muted dark:text-gray-500">
          YummySocial · Demo local · Versión 0.1.0
        </p>
      </div>
    </div>
  )
}
