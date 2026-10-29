import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { StoryRing } from '../components/StoryRing'
import { Toast } from '../components/Toast'
import { useToast } from '../lib/useToast'
import { profilePathFor } from '../lib/profiles'
import { countRecipeSecrets } from '../lib/secrets'
import { shareLink } from '../lib/share'
import { groupStoriesByAuthor } from '../lib/stories'
import { formatCount, timeAgo } from '../lib/time'
import { useAppStore, useCurrentUser, useUnreadNotifications } from '../store/useAppStore'
import type { Recipe, User } from '../types'

export function Feed() {
  const recipes = useAppStore((state) => state.recipes)
  const users = useAppStore((state) => state.users)
  const storyList = useAppStore((state) => state.stories)
  const viewedStories = useAppStore((state) => state.viewedStories)
  const currentUser = useCurrentUser()
  const unreadCount = useUnreadNotifications()
  const toggleLike = useAppStore((state) => state.toggleLike)
  const toggleSave = useAppStore((state) => state.toggleSave)
  const toggleFollow = useAppStore((state) => state.toggleFollow)
  const { message: toast, showToast } = useToast()

  const feed = useMemo(
    () =>
      [...recipes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [recipes],
  )

  const storyGroups = useMemo(
    () => groupStoriesByAuthor(storyList, users, currentUser, viewedStories),
    [storyList, users, currentUser, viewedStories],
  )

  const myStories = currentUser
    ? storyGroups.find((group) => group.author.id === currentUser.id)
    : undefined

  function getUser(userId: string): User | undefined {
    return users.find((user) => user.id === userId)
  }

  async function handleShare(recipe: Recipe) {
    const result = await shareLink({
      title: recipe.title,
      text: recipe.description,
      path: `/recipe/${recipe.id}`,
    })
    if (result !== 'copied') return

    showToast('Enlace copiado al portapapeles')
  }

  function handleFollow(author: User) {
    const wasFollowing = currentUser?.followingIds.includes(author.id) ?? false
    toggleFollow(author.id)
    showToast(
      wasFollowing ? `Dejaste de seguir a ${author.name}` : `Ahora sigues a ${author.name}`,
    )
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to="/feed"
            className="flex min-w-0 items-center gap-2"
            aria-label="YummySocial, inicio"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Icon name="lunch_dining" className="text-[20px]" />
            </span>
            <span className="truncate text-lg font-extrabold tracking-tight min-[360px]:text-xl">
              Yummy<span className="text-primary">Social</span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <IconButton to="/search" icon="search" label="Buscar recetas" />
            <IconButton
              to="/leaderboard"
              icon="leaderboard"
              label="Clasificación de chefs"
            />
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
          {currentUser ? (
            myStories ? (
              <Link
                to={`/stories/${currentUser.id}?s=${myStories.stories[myStories.stories.length - 1].id}`}
                state={{ from: '/feed' }}
                aria-label="Ver tu historia"
              >
                <StoryRing
                  avatar={myStories.stories[myStories.stories.length - 1].image}
                  label="Tu historia"
                  variant="gradient"
                />
              </Link>
            ) : (
              <Link to="/stories/new" aria-label="Crear tu primera historia">
                <StoryRing
                  avatar={currentUser.avatar}
                  label="Tu historia"
                  variant="empty"
                  withPlus
                />
              </Link>
            )
          ) : null}

          {storyGroups
            .filter((group) => group.author.id !== currentUser?.id)
            .map((group) => {
              const unseenStory = group.stories.find(
                (story) => !viewedStories.includes(story.id),
              )
              const target = unseenStory ?? group.stories[0]

              return (
                <Link
                  key={group.author.id}
                  to={`/stories/${group.author.id}?s=${target.id}`}
                  state={{ from: '/feed' }}
                  aria-label={`Ver historias de ${group.author.name}`}
                >
                  <StoryRing
                    avatar={group.author.avatar}
                    label={group.author.name}
                    variant={group.unseen ? 'gradient' : 'seen'}
                  />
                </Link>
              )
            })}
        </div>
      </section>

      <div className="flex flex-col">
        {feed.map((recipe) => {
          const author = getUser(recipe.authorId)
          const authorPath = author ? profilePathFor(author, currentUser?.id) : '/feed'
          const following = author
            ? (currentUser?.followingIds.includes(author.id) ?? false)
            : false
          const secrets = countRecipeSecrets(recipe)

          return (
            <article
              key={recipe.id}
              className="border-b border-line pb-4 dark:border-white/10"
            >
              <header className="flex items-center gap-3 px-4 py-3">
                <Link
                  to={authorPath}
                  aria-label={`Ver el perfil de ${author?.name ?? 'este cocinero'}`}
                  className="shrink-0"
                >
                  <img
                    src={author?.avatar ?? '/img/tabla-de-clasificaci-n-chefs-1-08.jpg'}
                    alt=""
                    className="size-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={authorPath}
                    className="block truncate text-sm font-bold transition-colors hover:text-primary"
                  >
                    {author?.name ?? 'Cocinero'}
                  </Link>
                  <p className="truncate text-xs text-muted dark:text-gray-400">
                    @{author?.username ?? 'yummysocial'} · {timeAgo(recipe.createdAt)}
                  </p>
                </div>
                {author && author.id !== currentUser?.id ? (
                  <button
                    type="button"
                    onClick={() => handleFollow(author)}
                    aria-pressed={following}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors active:scale-95 ${
                      following
                        ? 'border border-line text-muted hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10'
                        : 'bg-primary text-white shadow-sm shadow-primary/30'
                    }`}
                  >
                    {following ? 'Siguiendo' : 'Seguir'}
                  </button>
                ) : null}
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
                {secrets.total > 0 ? (
                  <span
                    aria-label={`${secrets.total} ${secrets.total === 1 ? 'secreto' : 'secretos'} en esta receta`}
                    className="absolute left-3 top-11 flex items-center gap-1 rounded-full bg-purple-600/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur"
                  >
                    <Icon name="lock" className="text-[12px]" />
                    {secrets.total}
                  </span>
                ) : null}
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
                    to={authorPath}
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

      <Toast message={toast} />
    </div>
  )
}
