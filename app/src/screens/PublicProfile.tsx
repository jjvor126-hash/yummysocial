import { useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { RecipeCard } from '../components/RecipeCard'
import { StoryRing } from '../components/StoryRing'
import { Toast } from '../components/Toast'
import { findUserByUsername, profilePath } from '../lib/profiles'
import { getRank } from '../lib/ranks'
import { shareLink } from '../lib/share'
import { isStoryActive } from '../lib/stories'
import { formatCount } from '../lib/time'
import { useToast } from '../lib/useToast'
import { useAppStore, useCurrentUser } from '../store/useAppStore'

export function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const users = useAppStore((state) => state.users)
  const recipes = useAppStore((state) => state.recipes)
  const stories = useAppStore((state) => state.stories)
  const highlights = useAppStore((state) => state.highlights)
  const toggleFollow = useAppStore((state) => state.toggleFollow)
  const currentUser = useCurrentUser()
  const { message: toast, showToast } = useToast()

  const user = useMemo(() => findUserByUsername(users, username), [users, username])

  const userRecipes = useMemo(
    () =>
      user
        ? recipes
            .filter((recipe) => recipe.authorId === user.id)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
        : [],
    [recipes, user],
  )

  const userHighlights = useMemo(
    () => (user ? highlights.filter((highlight) => highlight.userId === user.id) : []),
    [highlights, user],
  )

  if (!user) return <ProfileUnavailable username={username} />

  if (currentUser?.id === user.id) return <Navigate to="/profile" replace />

  const rank = getRank(user.stars)
  const isFollowing = currentUser?.followingIds.includes(user.id) ?? false
  const path = profilePath(user)

  function handleBack() {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (historyIndex > 0) {
      navigate(-1)
      return
    }
    navigate('/feed')
  }

  function handleFollow() {
    toggleFollow(user!.id)
    showToast(
      isFollowing ? `Dejaste de seguir a ${user!.name}` : `Ahora sigues a ${user!.name}`,
    )
  }

  async function handleShare() {
    const result = await shareLink({
      title: `${user!.name} (@${user!.username}) en YummySocial`,
      text: user!.bio,
      path,
    })

    if (result === 'copied') showToast('Enlace del perfil copiado')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <div className="flex items-center gap-1 px-3 py-2">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Volver"
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="arrow_back" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold tracking-tight">{user.name}</h1>
            <p className="truncate text-xs font-semibold text-primary">@{user.username}</p>
          </div>

          <button
            type="button"
            onClick={handleShare}
            aria-label={`Compartir el perfil de ${user.name}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="share" className="text-[20px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-10">
        <section className="px-4 pt-5" aria-label={`Perfil de ${user.name}`}>
          <div className="flex items-center gap-5">
            <span className="block shrink-0 rounded-full bg-gradient-to-tr from-primary via-orange-300 to-yellow-200 p-[3px] shadow-lg shadow-primary/20">
              <span className="block rounded-full border-[3px] border-surface dark:border-surface-dark">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="size-[88px] rounded-full object-cover"
                />
              </span>
            </span>

            <div className="grid flex-1 grid-cols-3 gap-1 text-center">
              <ProfileStat value={formatCount(userRecipes.length)} label="Recetas" />
              <ProfileStat value={formatCount(user.followers)} label="Seguidores" />
              <ProfileStat value={formatCount(user.following)} label="Seguidos" />
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xl font-bold leading-tight tracking-tight">{user.name}</p>
            <p className="text-sm font-semibold text-primary">@{user.username}</p>
            {user.bio ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted dark:text-gray-300">
                {user.bio}
              </p>
            ) : null}
            {user.location ? (
              <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-muted dark:text-gray-400">
                <Icon name="location_on" className="text-[14px]" />
                {user.location}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleFollow}
              aria-pressed={isFollowing}
              className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                isFollowing
                  ? 'border border-primary/25 bg-primary-soft text-primary hover:bg-primary/15 dark:border-white/10 dark:bg-white/10 dark:text-white'
                  : 'bg-primary text-white shadow-lg shadow-primary/30'
              }`}
            >
              <Icon name={isFollowing ? 'check' : 'person_add'} className="text-[20px]" />
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Compartir perfil"
              className="flex size-11 items-center justify-center rounded-xl border border-line bg-white text-ink transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Icon name="share" className="text-[20px]" />
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-orange-100 bg-gradient-to-br from-[#fffbf5] to-[#fff3e6] p-4 shadow-sm dark:border-white/10 dark:from-[#2c241b] dark:to-[#221910]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="rounded-md border border-primary/20 bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm dark:bg-white/10">
                  Nivel {rank.level}
                </span>
                <p className="mt-1.5 break-words text-sm font-bold leading-tight min-[360px]:text-base">
                  {rank.current.name}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-primary shadow-sm dark:bg-white/10">
                <Icon name="star" filled className="text-[16px]" />
                {formatCount(user.stars)}
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full border border-orange-100 bg-white shadow-inner dark:border-transparent dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-primary transition-[width] duration-500"
                style={{ width: `${Math.round(rank.progress * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] font-medium text-muted dark:text-gray-400">
              {rank.next
                ? `Faltan ${formatCount(rank.remaining)} estrellas para ${rank.next.name}.`
                : 'Rango máximo de la comunidad.'}
            </p>
          </div>
        </section>

        {userHighlights.length > 0 ? (
          <section aria-label="Historias destacadas" className="mt-6">
            <div className="mb-3 flex items-center gap-2 px-4">
              <h2 className="text-base font-bold">Historias destacadas</h2>
              <Icon name="history_toggle_off" className="text-[16px] text-primary" />
            </div>

            <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2">
              {userHighlights.map((highlight) => {
                const active = stories.some(
                  (story) => story.id === highlight.storyId && isStoryActive(story),
                )

                if (!active) {
                  return (
                    <button
                      key={highlight.id}
                      type="button"
                      onClick={() => showToast('Esa historia ya caducó')}
                      aria-label={`Destacado ${highlight.label} caducado`}
                      className="text-left"
                    >
                      <StoryRing
                        avatar={highlight.image}
                        label={highlight.label}
                        variant="seen"
                        className="w-[72px]"
                      />
                    </button>
                  )
                }

                return (
                  <Link
                    key={highlight.id}
                    to={`/stories/${user.id}?s=${highlight.storyId}`}
                    state={{ from: path }}
                    aria-label={`Ver destacado ${highlight.label}`}
                  >
                    <StoryRing
                      avatar={highlight.image}
                      label={highlight.label}
                      variant="gradient"
                      className="w-[72px]"
                    />
                  </Link>
                )
              })}
            </div>
          </section>
        ) : null}

        <section aria-label="Recetas publicadas" className="mt-6 px-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-base font-bold">Recetas</h2>
            <span className="text-xs font-semibold text-muted dark:text-gray-400">
              {formatCount(userRecipes.length)}
            </span>
          </div>

          {userRecipes.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {userRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="menu_book"
              title="Aún no hay recetas"
              description={`${user.name} todavía no ha publicado ninguna receta en YummySocial.`}
              action={
                <Link
                  to="/search"
                  className="mt-1 rounded-full bg-primary-soft px-5 py-2.5 text-xs font-bold text-primary transition-transform active:scale-95 dark:bg-white/5"
                >
                  Explorar recetas
                </Link>
              }
            />
          )}
        </section>
      </main>

      <Toast message={toast} />
    </div>
  )
}

function ProfileUnavailable({ username }: { username?: string }) {
  const navigate = useNavigate()

  function handleBack() {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (historyIndex > 0) {
      navigate(-1)
      return
    }
    navigate('/feed')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Volver"
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Perfil</h1>
      </header>

      <div className="px-4 py-8">
        <EmptyState
          icon="person_off"
          title="Perfil no encontrado"
          description={
            username
              ? `No existe ningún cocinero con el usuario @${username}.`
              : 'Este perfil no está disponible.'
          }
          action={
            <Link
              to="/search"
              className="mt-1 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
            >
              Descubrir cocineros
            </Link>
          }
        />
      </div>
    </div>
  )
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold leading-tight">{value}</span>
      <span className="text-[10px] font-medium text-muted min-[360px]:text-xs dark:text-gray-400">
        {label}
      </span>
    </div>
  )
}
