import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'

export function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary dark:bg-white/5">
        <Icon name="ramen_dining" className="text-[32px]" />
      </div>
      <h1 className="text-xl font-extrabold tracking-tight">Esta página no existe</h1>
      <p className="mt-2 max-w-xs text-sm text-muted dark:text-gray-400">
        Puede que el enlace esté roto o que la receta ya no esté disponible.
      </p>
      <Link
        to="/feed"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
