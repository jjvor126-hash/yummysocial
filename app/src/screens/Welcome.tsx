import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'

export function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="relative h-[44dvh] min-h-[280px] w-full overflow-hidden">
        <img
          src="/img/bienvenida-e-inicio-de-sesi-n-01.jpg"
          alt="Mesa con pasta recién hecha y luz cálida"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/10 to-transparent dark:from-surface-dark" />

        <div className="absolute left-5 top-5 flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
            <Icon name="lunch_dining" className="text-[22px]" />
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold tracking-tight text-ink shadow-lg">
            YummySocial
          </span>
        </div>
      </div>

      <div className="relative -mt-10 flex flex-1 flex-col px-6 pb-8">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
          Comparte tu <span className="text-primary">pasión culinaria</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted dark:text-gray-400">
          Descubre recetas frescas, inspírate con platos únicos y únete a la comunidad más
          sabrosa.
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white text-sm font-bold text-ink transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <svg className="size-6" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google
          </button>

          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
          >
            <Icon name="mail" className="text-[22px]" />
            Registrarse con email
          </button>

          <p className="mt-1 text-center text-[11px] leading-normal text-muted dark:text-gray-500">
            Al continuar aceptas nuestros{' '}
            <span className="font-medium underline decoration-primary/50">Términos</span> y{' '}
            <span className="font-medium underline decoration-primary/50">
              Política de Privacidad
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
