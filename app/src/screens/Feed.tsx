import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { shareRecipe } from '../lib/share'
import { formatCount, timeAgo } from '../lib/time'
import { useAppStore, useCurrentUser, useUnreadNotifications } from '../store/useAppStore'
import type { Recipe, User } from '../types'

export function Feed() {
  const recipes = useAppStore((state) => state.recipes)
  const users = useAppStore((state) => state.users)
  const currentUser = useCurrentUser()
  const unreadCount = useUnreadNotifications()
  const toggleLike = useAppStore((state) => state.toggleLike)
  const toggleSave = useAppStore((state) => state.toggleSave)
  const [toast, setToast] = useState<string | null>(null)

  const feed = useMemo(
    () =>
      [...recipes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [recipes],
  )

  const stories = useMemo(() => {
    const others = users.filter((user) => user.id !== currentUser?.id).slice(0, 7)
    return currentUser ? [currentUser, ...others] : others
  }, [users, currentUser])

  function getUser(userId: string): User | undefined {
    return users.find((user) => user.id === userId)
  }

  async function handleShare(recipe: Recipe) {
    const result = await shareRecipe({
      title: recipe.title,
      text: recipe.description,
      path: `/recipe/${recipe.id}`,
    })
    if (result !== 'copied') return

    setToast('Enlace copiado al portapapeles')
    window.setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/feed" className="flex items-center gap-2" aria-label="YummySocial, inicio">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
              <Icon name="lunch_dining" className="text-[20px]" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              Yummy<span className="text-primary">Social</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <IconButton to="/search" icon="search" label="Buscar recetas" />
            <IconButton
              to="/notifications"
              icon="notifications"
              label={
                unreadCount > 0
                  ? `Notificaciones, ${unreadCount} sin leer`
                  : 'Notificaciones'
              }
              badge={unreadCount > 0}
            />
          </div>
        </div>
      </header>

      <section aria-label="Historias" className="border-b border-line px-4 py-3 dark:border-white/10">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
          {stories.map((story, index) => {
            const mine = index === 0 && story.id === currentUser?.id
            return (
              <Link
                key={story.id}
                to="/profile"
                className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
              >
                <span
                  className={
                    mine
                      ? 'rounded-full border-2 border-dashed border-primary p-[3px]'
                      : 'rounded-full bg-linear-to-tr from-primary via-orange-300 to-yellow-200 p-[2px]'
                  }
                >
                  <span className="block rounded-full bg-surface p-[2px] dark:bg-surface-dark">
                    <img
                      src={story.avatar}
                      alt=""
                      className="size-16 rounded-full object-cover"
                    />
                  </span>
                </span>
                <span className="w-full truncate text-center text-[11px] font-medium">
                  {mine ? 'Tu historia' : story.name}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="flex flex-col">
        {feed.map((recipe) => {
          const author = getUser(recipe.authorId)
          return (
            <article
              key={recipe.id}
              className="border-b border-line pb-4 dark:border-white/10"
            >
              <header className="flex items-center gap-3 px-4 py-3">
                <img
                  src={author?.avatar ?? '/img/tabla-de-clasificaci-n-chefs-1-08.jpg'}
                  alt=""
                  className="size-10 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{author?.name ?? 'Cocinero'}</p>
                  <p className="text-xs text-muted dark:text-gray-400">
                    @{author?.username ?? 'yummysocial'} · {timeAgo(recipe.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Más opciones"
                  className="ml-auto flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <Icon name="more_horiz" />
                </button>
              </header>

              <Link to={`/recipe/${recipe.id}`} className="relative block">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
                  {recipe.difficulty}
                </span>
              </Link>

              <div className="flex items-center gap-4 px-4 pt-3">
                <button
                  type="button"
                  aria-label={recipe.likedByMe ? 'Quitar me gusta' : 'Me gusta'}
                  aria-pressed={recipe.likedByMe}
                  onClick={() => toggleLike(recipe.id)}
                  className={`transition-transform active:scale-90 ${
                    recipe.likedByMe
                      ? 'text-primary'
                      : 'text-ink hover:text-primary dark:text-white'
                  }`}
                >
                  <Icon name="favorite" className="text-[26px]" filled={recipe.likedByMe} />
                </button>
                <Link
                  to={`/recipe/${recipe.id}`}
                  aria-label="Ver comentarios"
                  className="text-ink transition-colors hover:text-primary dark:text-white"
                >
                  <Icon name="mode_comment" className="text-[24px]" />
                </Link>
                <button
                  type="button"
                  aria-label="Compartir"
                  onClick={() => handleShare(recipe)}
                  className="text-ink transition-colors hover:text-primary dark:text-white"
                >
                  <Icon name="send" className="text-[24px]" />
                </button>
                <button
                  type="button"
                  aria-label={recipe.savedByMe ? 'Quitar de guardadas' : 'Guardar'}
                  aria-pressed={recipe.savedByMe}
                  onClick={() => toggleSave(recipe.id)}
                  className={`ml-auto transition-colors active:scale-90 ${
                    recipe.savedByMe
                      ? 'text-primary'
                      : 'text-ink hover:text-primary dark:text-white'
                  }`}
                >
                  <Icon name="bookmark" className="text-[24px]" filled={recipe.savedByMe} />
                </button>
              </div>

              <div className="space-y-1 px-4 pt-2">
                <p className="text-sm font-bold">
                  {formatCount(recipe.likes)} me gusta
                </p>
                <p className="text-sm leading-snug">
                  <Link
                    to="/profile"
                    className="font-bold hover:text-primary"
                  >
                    @{author?.username ?? 'yummysocial'}
                  </Link>{' '}
                  {recipe.description}
                </p>
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="block text-sm text-muted hover:text-primary dark:text-gray-400"
                >
                  Ver los {formatCount(recipe.commentCount)} comentarios
                </Link>
                <p className="text-[10px] uppercase tracking-wide text-muted dark:text-gray-500">
                  {timeAgo(recipe.createdAt)}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <Icon name="check_circle" className="text-[28px] text-primary" />
        <p className="text-sm font-bold">Estás al día</p>
        <p className="text-xs text-muted dark:text-gray-400">
          Sigue a más cocineros para llenar tu feed de ideas.
        </p>
        <Link
          to="/search"
          className="mt-2 rounded-full bg-primary-soft px-4 py-2 text-xs font-bold text-primary dark:bg-white/5"
        >
          Descubrir recetas
        </Link>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-lg dark:bg-white dark:text-ink"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
