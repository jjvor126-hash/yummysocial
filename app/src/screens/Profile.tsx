import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EditProfileSheet } from '../components/EditProfileSheet'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { RecipeCard } from '../components/RecipeCard'
import { StarGuideSheet } from '../components/StarGuide'
import { StoryRing } from '../components/StoryRing'
import { Toast } from '../components/Toast'
import { useToast } from '../lib/useToast'
import { getRank } from '../lib/ranks'
import { shareLink } from '../lib/share'
import { isStoryActive } from '../lib/stories'
import { isSubscriptionActive, subscriptionEndLabel } from '../lib/subscription'
import { formatCount } from '../lib/time'
import { useAppStore, useCurrentUser, useUnreadNotifications } from '../store/useAppStore'
import type { Recipe } from '../types'

type Tab = 'recipes' | 'saved'

function byNewest(a: Recipe, b: Recipe) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

export function Profile() {
  const user = useCurrentUser()
  const recipes = useAppStore((state) => state.recipes)
  const stories = useAppStore((state) => state.stories)
  const highlights = useAppStore((state) => state.highlights)
  const subscription = useAppStore((state) => state.subscription)
  const unreadCount = useUnreadNotifications()
  const [tab, setTab] = useState<Tab>('recipes')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const { message: toast, showToast } = useToast()

  const myRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.authorId === user?.id).sort(byNewest),
    [recipes, user?.id],
  )

  const savedRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.savedByMe).sort(byNewest),
    [recipes],
  )

  const myHighlights = useMemo(
    () => highlights.filter((highlight) => highlight.userId === user?.id),
    [highlights, user?.id],
  )

  if (!user) return null

  const rank = getRank(user.stars)
  const subscriptionActive = isSubscriptionActive(subscription)
  const visibleRecipes = tab === 'recipes' ? myRecipes : savedRecipes

  const handleShare = async () => {
    const result = await shareLink({
      title: `${user.name} (@${user.username}) en YummySocial`,
      text: user.bio,
      path: '/profile',
    })

    if (result === 'copied') showToast('Enlace del perfil copiado')
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-extrabold tracking-tight">Mi perfil</h1>
          <div className="flex items-center gap-1">
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
            <IconButton to="/settings" icon="settings" label="Ajustes" />
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <span className="block rounded-full bg-gradient-to-tr from-primary via-orange-300 to-yellow-200 p-[3px] shadow-lg shadow-primary/20">
              <span className="block rounded-full border-[3px] border-surface dark:border-surface-dark">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="size-[88px] rounded-full object-cover"
                />
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label="Editar foto de perfil"
              className="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-2 border-surface bg-primary text-white shadow-md transition-transform active:scale-95 dark:border-surface-dark"
            >
              <Icon name="edit" className="text-[14px]" />
            </button>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-1 text-center">
            <ProfileStat value={formatCount(myRecipes.length)} label="Recetas" />
            <ProfileStat value={formatCount(user.followers)} label="Seguidores" />
            <ProfileStat value={formatCount(user.following)} label="Seguidos" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-xl font-bold leading-tight tracking-tight">{user.name}</p>
            {subscriptionActive ? (
              <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c026d3] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                <Icon name="verified" filled className="text-[12px]" />
                Yummy+
              </span>
            ) : null}
          </div>
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
            onClick={() => setSheetOpen(true)}
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
          >
            Editar perfil
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

        <Link
          to="/premium"
          className="mt-3 flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 transition-colors hover:bg-purple-100/70 dark:border-purple-500/30 dark:bg-purple-900/15 dark:hover:bg-purple-900/25"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white">
            <Icon name="workspace_premium" filled className="text-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-purple-800 dark:text-purple-200">
              {subscriptionActive ? 'Yummy+ activo' : 'Hazte Yummy+'}
            </span>
            <span className="block truncate text-[11px] text-purple-700/80 dark:text-purple-300">
              {subscriptionActive
                ? `Todos los secretos abiertos · hasta el ${subscriptionEndLabel(subscription)}`
                : 'Abre todos los secretos sin esperar al nivel'}
            </span>
          </span>
          <Icon name="chevron_right" className="text-purple-500 dark:text-purple-300" />
        </Link>

        <section
          aria-label="Nivel"
          className="relative mt-4 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-[#fffbf5] to-[#fff3e6] p-4 shadow-sm dark:border-white/10 dark:from-[#2c241b] dark:to-[#221910]"
        >
          <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <span className="rounded-md border border-primary/20 bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm dark:bg-white/10">
                Nivel actual
              </span>
              <h2 className="mt-1.5 text-lg font-bold leading-tight">{rank.current.name}</h2>
            </div>
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-white text-2xl shadow-sm dark:border-white/10 dark:bg-white/10">
              <span aria-hidden="true">👨‍🍳</span>
              <span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#2c241b]">
                Lvl {rank.level}
              </span>
            </div>
          </div>

          <div className="relative mt-3">
            <p className="text-xs font-medium leading-snug text-muted dark:text-gray-400">
              {rank.next ? (
                <>
                  ¡A mover el bigote! Faltan{' '}
                  <span className="font-bold text-primary">
                    {formatCount(rank.remaining)} estrellas
                  </span>{' '}
                  para subir de rango.
                </>
              ) : (
                '¡Eres leyenda! Estás en el rango máximo de la comunidad.'
              )}
            </p>

            <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-orange-100 bg-white shadow-inner dark:border-transparent dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-primary transition-[width] duration-500"
                style={{ width: `${Math.round(rank.progress * 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted dark:text-gray-400">
                <Icon name="star" filled className="text-[13px]" />
                {formatCount(user.stars)} estrellas
              </span>
              {rank.next ? (
                <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm dark:bg-white/10">
                  {rank.next.name}
                  <Icon name="arrow_forward" className="text-[12px]" />
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="relative mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-primary/20 bg-white/80 px-3 py-2.5 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
          >
            <span className="flex items-center gap-1.5">
              <Icon name="stars" className="text-[17px]" />
              Cómo ganar estrellas
            </span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>

          <Link
            to="/leaderboard"
            className="relative mt-2 flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-white/80 px-3 py-2.5 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
          >
            <span className="flex items-center gap-1.5">
              <Icon name="leaderboard" className="text-[17px]" />
              Ver clasificación de chefs
            </span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </Link>
        </section>
      </div>

      <section aria-label="Historias destacadas" className="mt-6">
        <div className="mb-3 flex items-center gap-2 px-4">
          <h2 className="text-base font-bold">Historias destacadas</h2>
          <Icon name="history_toggle_off" className="text-[16px] text-primary" />
        </div>

        <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2">
          <Link
            to="/stories/new"
            aria-label="Crear historia"
            className="flex w-[72px] shrink-0 flex-col items-center gap-2"
          >
            <span className="flex size-[72px] items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-primary-soft transition-transform active:scale-95 dark:bg-primary/10">
              <Icon name="add" className="text-[30px] text-primary" />
            </span>
            <span className="text-xs font-medium">Nueva</span>
          </Link>

          {myHighlights.map((highlight) => {
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
                state={{ from: '/profile' }}
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

      <div className="sticky top-[65px] z-20 mt-4 border-y border-line bg-surface/95 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/95">
        <div className="flex px-4">
          <ProfileTab
            active={tab === 'recipes'}
            onClick={() => setTab('recipes')}
            icon="grid_view"
            label="Recetas"
            count={myRecipes.length}
          />
          <ProfileTab
            active={tab === 'saved'}
            onClick={() => setTab('saved')}
            icon="bookmark"
            label="Guardadas"
            count={savedRecipes.length}
          />
        </div>
      </div>

      <div className="px-4 py-4">
        {visibleRecipes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {visibleRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : tab === 'recipes' ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-10 text-center dark:border-white/10 dark:bg-white/5">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-primary/10">
              <Icon name="menu_book" className="text-[28px]" />
            </span>
            <p className="text-sm font-bold">Aún no has publicado recetas</p>
            <p className="max-w-[240px] text-xs text-muted dark:text-gray-400">
              Comparte tu primer plato y empieza a sumar estrellas en la comunidad.
            </p>
            <Link
              to="/create"
              className="mt-1 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
            >
              Crear receta
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-10 text-center dark:border-white/10 dark:bg-white/5">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-primary/10">
              <Icon name="bookmark" className="text-[28px]" />
            </span>
            <p className="text-sm font-bold">Todavía no guardas recetas</p>
            <p className="max-w-[240px] text-xs text-muted dark:text-gray-400">
              Toca el marcador en una receta del feed para tenerla siempre a mano.
            </p>
            <Link
              to="/feed"
              className="mt-1 rounded-full bg-primary-soft px-5 py-2.5 text-xs font-bold text-primary transition-transform active:scale-95 dark:bg-white/5"
            >
              Explorar recetas
            </Link>
          </div>
        )}
      </div>

      <EditProfileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={showToast}
      />
      <StarGuideSheet open={guideOpen} onClose={() => setGuideOpen(false)} />
      <Toast message={toast} />
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

function ProfileTab({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 flex-col items-center justify-center border-b-[3px] py-3 transition-colors ${
        active
          ? 'border-primary text-ink dark:text-white'
          : 'border-transparent text-muted hover:text-ink dark:text-gray-500 dark:hover:text-gray-300'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon name={icon} className="text-xl" filled={active} />
        <span className="text-sm font-bold tracking-wide">{label}</span>
        {count > 0 ? (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            {count}
          </span>
        ) : null}
      </span>
    </button>
  )
}
