import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import { useToast } from '../lib/useToast'
import { SECRET_STAR_COST } from '../lib/constants'
import { profilePathFor } from '../lib/profiles'
import { getSecretAccess, isSecretItem } from '../lib/secrets'
import type { SecretAccess } from '../lib/secrets'
import { shareLink } from '../lib/share'
import { STAR_REWARDS } from '../lib/stars'
import { isSubscriptionActive } from '../lib/subscription'
import { formatCount, timeAgo } from '../lib/time'
import { useAppStore, useCurrentUser } from '../store/useAppStore'
import type { Comment, Ingredient, Recipe, RecipeStep, User } from '../types'

type StatTone = 'primary' | 'green' | 'amber' | 'blue'

const statTones: Record<StatTone, { card: string; icon: string; label: string }> = {
  primary: {
    card: 'bg-primary text-white shadow-lg shadow-primary/25',
    icon: 'bg-white/20',
    label: 'text-white/90',
  },
  green: {
    card: 'border border-green-200/60 bg-green-100 text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-300',
    icon: 'bg-white/60 dark:bg-white/10',
    label: 'opacity-80',
  },
  amber: {
    card: 'border border-orange-100 bg-orange-50 text-orange-700 dark:border-orange-800/50 dark:bg-orange-900/10 dark:text-orange-300',
    icon: 'bg-white/60 dark:bg-white/10',
    label: 'opacity-80',
  },
  blue: {
    card: 'border border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/10 dark:text-blue-300',
    icon: 'bg-white/60 dark:bg-white/10',
    label: 'opacity-80',
  },
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string
  label: string
  value: string
  tone: StatTone
}) {
  const palette = statTones[tone]

  return (
    <div className={`flex items-center gap-3 rounded-2xl p-3.5 ${palette.card}`}>
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${palette.icon}`}
      >
        <Icon name={icon} className="text-[22px]" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className={`text-[11px] font-medium ${palette.label}`}>{label}</span>
        <span className="mt-0.5 truncate text-base font-bold leading-none">{value}</span>
      </span>
    </div>
  )
}

function RecipeUnavailable() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary dark:bg-white/5">
        <Icon name="ramen_dining" className="text-[32px]" />
      </div>
      <h1 className="text-xl font-extrabold tracking-tight">Receta no encontrada</h1>
      <p className="mt-2 max-w-xs text-sm text-muted dark:text-gray-400">
        Puede que el enlace esté roto o que la receta ya no esté disponible.
      </p>
      <Link
        to="/feed"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30"
      >
        Volver al feed
      </Link>
    </div>
  )
}

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const recipe = useAppStore((state) => state.recipes.find((item) => item.id === id))
  const users = useAppStore((state) => state.users)
  const comments = useAppStore((state) => state.comments)
  const unlockedSecrets = useAppStore((state) => state.unlockedSecrets)
  const subscription = useAppStore((state) => state.subscription)
  const toggleLike = useAppStore((state) => state.toggleLike)
  const toggleFollow = useAppStore((state) => state.toggleFollow)
  const addComment = useAppStore((state) => state.addComment)
  const toggleCommentLike = useAppStore((state) => state.toggleCommentLike)
  const unlockSecrets = useAppStore((state) => state.unlockSecrets)

  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(() => new Set())
  const [doneSteps, setDoneSteps] = useState<Set<string>>(() => new Set())
  const [showAllComments, setShowAllComments] = useState(false)
  const [composerText, setComposerText] = useState('')
  const { message: toast, showToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const noticeRef = useRef(
    (location.state as { notice?: string } | null)?.notice ?? null,
  )

  useEffect(() => {
    if (!noticeRef.current) return
    showToast(noticeRef.current)
    noticeRef.current = null
    navigate(location.pathname, { replace: true, state: null })
  }, [navigate, location.pathname, showToast])

  const recipeComments = useMemo(
    () =>
      comments
        .filter((comment) => comment.recipeId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [comments, id],
  )

  if (!recipe) return <RecipeUnavailable />

  const recipeId = recipe.id
  const author = users.find((user) => user.id === recipe.authorId)
  const authorPath = author ? profilePathFor(author, currentUser?.id) : '/feed'
  const isMine = recipe.authorId === currentUser?.id
  const isFollowing = currentUser?.followingIds.includes(recipe.authorId) ?? false
  const stars = currentUser?.stars ?? 0
  const subscriptionActive = isSubscriptionActive(subscription)
  const canBuyShortcut = stars >= SECRET_STAR_COST
  const recipeShortcut = unlockedSecrets.includes(recipe.id)
  const visibleComments = showAllComments ? recipeComments : recipeComments.slice(0, 3)

  function accessFor(item: Ingredient | RecipeStep): SecretAccess {
    return getSecretAccess({
      item,
      stars,
      subscriptionActive,
      recipeShortcut,
      isAuthor: isMine,
    })
  }

  function secretBadge(access: SecretAccess): string {
    if (access.isAuthor) return 'Tu secreto'
    if (access.unlockedBySubscription) return 'Yummy+'
    if (access.unlockedByLevel) return `Nivel ${access.requiredLevel}`
    if (access.unlockedByShortcut) return 'Desbloqueado'
    return 'Secreto'
  }

  const allSecretItems: Array<Ingredient | RecipeStep> = [
    ...recipe.ingredients,
    ...recipe.steps,
  ]
  const totalSecrets = allSecretItems.filter(isSecretItem).length
  const lockedSecrets = allSecretItems.filter((item) => {
    const access = accessFor(item)
    return access.isSecret && !access.unlocked
  }).length

  function findUser(userId: string): User | undefined {
    return users.find((user) => user.id === userId)
  }

  function handleBack() {
    if (location.key === 'default') {
      navigate('/feed')
      return
    }
    navigate(-1)
  }

  async function handleShare(target: Recipe) {
    const result = await shareLink({
      title: target.title,
      text: target.description,
      path: `/recipe/${target.id}`,
    })
    if (result === 'copied') showToast('Enlace copiado al portapapeles')
  }

  function handleUnlock(target: Recipe) {
    if (!canBuyShortcut) return
    unlockSecrets(target.id)
    showToast(`Secretos desbloqueados con ${SECRET_STAR_COST} ★`)
  }

  function toggleIngredient(ingredientId: string) {
    setCheckedIngredients((current) => {
      const next = new Set(current)
      if (next.has(ingredientId)) next.delete(ingredientId)
      else next.add(ingredientId)
      return next
    })
  }

  function toggleStep(stepId: string) {
    setDoneSteps((current) => {
      const next = new Set(current)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  function handleReply(username: string) {
    setComposerText(`@${username} `)
    inputRef.current?.focus()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = composerText.trim()
    if (!trimmed) return

    addComment(recipeId, trimmed)
    setComposerText('')
    setShowAllComments(true)
    showToast(`Comentario publicado · +${STAR_REWARDS.comment} ★`)
  }

  return (
    <div className="flex min-h-dvh flex-col pb-28">
      <div className="relative h-[40vh] min-h-[260px] w-full shrink-0">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Volver"
            className="flex size-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-black/40"
          >
            <Icon name="arrow_back" />
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleShare(recipe)}
              aria-label="Compartir receta"
              className="flex size-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-black/40"
            >
              <Icon name="share" />
            </button>
            <button
              type="button"
              onClick={() => toggleLike(recipe.id)}
              aria-label={recipe.likedByMe ? 'Quitar me gusta' : 'Me gusta'}
              aria-pressed={recipe.likedByMe}
              className={`flex size-10 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-colors ${
                recipe.likedByMe
                  ? 'bg-white text-primary hover:bg-white/90'
                  : 'bg-black/25 text-white hover:bg-black/40'
              }`}
            >
              <Icon name="favorite" filled={recipe.likedByMe} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-8 flex flex-col rounded-t-[32px] bg-surface px-5 pt-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:bg-surface-dark">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line dark:bg-white/15" />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{recipe.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted dark:text-gray-400">
              {recipe.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center rounded-2xl border border-primary/10 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            {recipe.ratingCount > 0 ? (
              <>
                <div className="flex items-center gap-1 text-primary">
                  <span className="text-lg font-extrabold leading-none">
                    {recipe.rating.toFixed(1)}
                  </span>
                  <Icon name="star" filled className="text-[16px]" />
                </div>
                <span className="mt-1 text-[10px] font-medium text-muted dark:text-gray-400">
                  {formatCount(recipe.ratingCount)} reseñas
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-extrabold leading-none text-primary">Nuevo</span>
                <span className="mt-1 text-[10px] font-medium text-muted dark:text-gray-400">
                  Sin reseñas
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary dark:bg-primary/15"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Link
            to={authorPath}
            aria-label={`Ver el perfil de ${author?.name ?? 'el autor'}`}
            className="shrink-0"
          >
            <img
              src={author?.avatar ?? '/img/detalle-de-receta-1-02.jpg'}
              alt=""
              className="size-10 rounded-full object-cover ring-2 ring-white dark:ring-white/20"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{author?.name ?? 'Cocinero'}</p>
            <p className="text-xs font-medium text-primary">Autor/a de la receta</p>
          </div>
          {isMine ? null : (
            <button
              type="button"
              onClick={() => toggleFollow(recipe.authorId)}
              aria-pressed={isFollowing}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                isFollowing
                  ? 'bg-primary-soft text-primary hover:bg-primary/20 dark:bg-white/10'
                  : 'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary-dark'
              }`}
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatCard
            icon="schedule"
            label="Tiempo"
            value={`${recipe.timeMinutes} min`}
            tone="primary"
          />
          <StatCard
            icon="bar_chart"
            label="Dificultad"
            value={recipe.difficulty}
            tone="green"
          />
          <StatCard
            icon="local_fire_department"
            label="Calorías"
            value={recipe.calories > 0 ? formatCount(recipe.calories) : '—'}
            tone="amber"
          />
          <StatCard
            icon="restaurant"
            label="Porciones"
            value={`${recipe.servings} pers.`}
            tone="blue"
          />
        </div>

        <section className="mt-8" aria-labelledby="ingredientes-title">
          <div className="flex items-center justify-between">
            <h2 id="ingredientes-title" className="text-xl font-bold">
              Ingredientes
            </h2>
            <span className="text-sm text-muted dark:text-gray-400">
              {recipe.ingredients.length}{' '}
              {recipe.ingredients.length === 1 ? 'ítem' : 'ítems'}
            </span>
          </div>

          {totalSecrets > 0 ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-[11px] font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-200">
              <Icon name="lock" className="text-[15px]" />
              <span className="flex-1">
                {lockedSecrets > 0
                  ? `${lockedSecrets} de ${totalSecrets} ${totalSecrets === 1 ? 'secreto bloqueado' : 'secretos bloqueados'}`
                  : `${totalSecrets} ${totalSecrets === 1 ? 'secreto desbloqueado' : 'secretos desbloqueados'}`}
              </span>
              {lockedSecrets > 0 && !subscriptionActive ? (
                <Link
                  to="/premium"
                  className="rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
                >
                  Yummy+
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 flex flex-col gap-2.5">
            {recipe.ingredients.map((ingredient) => {
              const checked = checkedIngredients.has(ingredient.id)
              const access = accessFor(ingredient)
              const locked = access.isSecret && !access.unlocked

              if (locked) {
                return (
                  <div
                    key={ingredient.id}
                    className="rounded-xl border border-dashed border-purple-200 bg-purple-50 p-3 dark:border-purple-800/60 dark:bg-purple-900/15"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-purple-200 text-purple-600 dark:bg-purple-800 dark:text-purple-200">
                        <Icon name="lock" className="text-[14px]" />
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex-1 select-none text-sm font-medium text-purple-900/60 blur-[3px] dark:text-purple-100/50"
                      >
                        {ingredient.amount} {ingredient.name}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                        {access.premiumOnly ? 'Yummy+' : `Nivel ${access.requiredLevel}`}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 pl-8">
                      <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-200">
                        {access.premiumOnly
                          ? 'Exclusivo para suscriptores Yummy+'
                          : `Se abre en el nivel ${access.requiredLevel} · ${access.requiredRank}`}
                      </span>
                      {access.premiumOnly ? (
                        <Link
                          to="/premium"
                          className="ml-auto rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm"
                        >
                          Ver Yummy+
                        </Link>
                      ) : canBuyShortcut ? (
                        <button
                          type="button"
                          onClick={() => handleUnlock(recipe)}
                          aria-label={`Desbloquear los secretos de esta receta con ${SECRET_STAR_COST} estrellas`}
                          className="ml-auto rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
                        >
                          Desbloquear · {SECRET_STAR_COST} ★
                        </button>
                      ) : (
                        <span className="ml-auto text-[10px] font-semibold text-purple-500 dark:text-purple-300">
                          Faltan {SECRET_STAR_COST - stars} ★ para el atajo
                        </span>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <label
                  key={ingredient.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 shadow-sm transition-colors ${
                    checked
                      ? 'border-primary/30 bg-primary-soft/70 dark:border-primary/20 dark:bg-white/5'
                      : 'border-transparent bg-white dark:bg-white/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleIngredient(ingredient.id)}
                    className="size-5 shrink-0 cursor-pointer accent-primary"
                  />
                  <span
                    className={`flex-1 text-sm font-medium transition-colors ${
                      checked
                        ? 'text-muted line-through dark:text-gray-500'
                        : 'text-ink dark:text-gray-100'
                    }`}
                  >
                    <span className="font-bold">{ingredient.amount}</span> {ingredient.name}
                  </span>
                  {access.isSecret ? (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                      {secretBadge(access)}
                    </span>
                  ) : null}
                  <Icon
                    name="check_circle"
                    filled={checked}
                    className={`text-[20px] ${
                      checked ? 'text-primary' : 'text-line dark:text-white/15'
                    }`}
                  />
                </label>
              )
            })}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="preparacion-title">
          <h2 id="preparacion-title" className="text-xl font-bold">
            Preparación
          </h2>
          <p className="mt-1 text-xs text-muted dark:text-gray-500">
            Toca un paso para marcarlo como hecho.
          </p>

          <ol className="mt-4 space-y-6">
            {recipe.steps.map((step, index) => {
              const access = accessFor(step)
              const locked = access.isSecret && !access.unlocked
              const done = doneSteps.has(step.id)
              const last = index === recipe.steps.length - 1

              return (
                <li key={step.id} className="relative flex gap-3">
                  {last ? null : (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-6 left-[19px] top-11 w-0.5 bg-primary/20"
                    />
                  )}

                  <span
                    className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-surface dark:ring-surface-dark ${
                      locked
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300'
                        : done
                          ? 'bg-primary text-white shadow-md shadow-primary/25'
                          : 'bg-primary/15 text-primary'
                    }`}
                  >
                    {locked ? <Icon name="lock" className="text-[18px]" /> : index + 1}
                  </span>

                  {locked ? (
                    <div className="flex-1 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/60 p-4 text-left dark:border-purple-800/60 dark:bg-purple-900/10">
                      <span className="flex items-center gap-2">
                        <Icon
                          name={access.premiumOnly ? 'workspace_premium' : 'lock'}
                          className="text-[20px] text-purple-600 dark:text-purple-300"
                        />
                        <span className="text-base font-bold text-purple-800 dark:text-purple-200">
                          {access.premiumOnly ? 'Paso solo Yummy+' : 'Paso secreto'}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-1 block select-none text-sm leading-relaxed text-purple-900/50 blur-[4px] dark:text-purple-100/40"
                      >
                        {step.text}
                      </span>
                      <span className="mt-2 block text-[11px] font-semibold text-purple-700 dark:text-purple-200">
                        {access.premiumOnly
                          ? 'Exclusivo para suscriptores Yummy+'
                          : `Se abre en el nivel ${access.requiredLevel} · ${access.requiredRank}`}
                      </span>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {access.premiumOnly ? (
                          <Link
                            to="/premium"
                            className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-purple-600/30"
                          >
                            <Icon name="workspace_premium" className="text-[14px]" />
                            Ver Yummy+
                          </Link>
                        ) : canBuyShortcut ? (
                          <button
                            type="button"
                            onClick={() => handleUnlock(recipe)}
                            aria-label={`Desbloquear los secretos de esta receta con ${SECRET_STAR_COST} estrellas`}
                            className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-purple-600/30 transition-colors hover:bg-purple-700"
                          >
                            <Icon name="lock_open" className="text-[14px]" />
                            Desbloquear con {SECRET_STAR_COST} ★
                          </button>
                        ) : (
                          <span className="rounded-full bg-purple-100 px-3 py-1.5 text-[11px] font-bold text-purple-600 dark:bg-purple-900/40 dark:text-purple-200">
                            Faltan {SECRET_STAR_COST - stars} ★ para el atajo
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      aria-pressed={done}
                      className={`flex-1 rounded-2xl p-4 text-left transition-colors ${
                        done
                          ? 'bg-primary-soft/70 dark:bg-white/5'
                          : 'bg-white shadow-sm dark:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`text-base font-bold ${
                            done ? 'text-muted line-through dark:text-gray-500' : ''
                          }`}
                        >
                          Paso {index + 1}
                        </span>
                        {access.isSecret ? (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                            {secretBadge(access)}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={`mt-1 block text-sm leading-relaxed ${
                          done
                            ? 'text-muted line-through dark:text-gray-500'
                            : 'text-muted dark:text-gray-300'
                        }`}
                      >
                        {step.text}
                      </span>
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <section className="mt-8" aria-labelledby="comentarios-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="comentarios-title" className="text-xl font-bold">
              Comentarios
            </h2>
            {recipeComments.length > 3 ? (
              <button
                type="button"
                onClick={() => setShowAllComments((value) => !value)}
                className="text-xs font-semibold text-primary"
              >
                {showAllComments ? 'Ver menos' : `Ver todos (${formatCount(recipe.commentCount)})`}
              </button>
            ) : (
              <span className="text-xs text-muted dark:text-gray-500">
                {formatCount(recipe.commentCount)} comentarios
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {visibleComments.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 text-sm text-muted shadow-sm dark:bg-white/5 dark:text-gray-400">
                Aún no hay comentarios. Sé el primero en opinar.
              </p>
            ) : (
              visibleComments.map((comment: Comment) => {
                const commentUser = findUser(comment.userId)
                const commentAuthorPath = commentUser
                  ? profilePathFor(commentUser, currentUser?.id)
                  : '/feed'

                return (
                  <article
                    key={comment.id}
                    className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5"
                  >
                    <Link
                      to={commentAuthorPath}
                      aria-label={`Ver el perfil de ${commentUser?.name ?? 'este cocinero'}`}
                      className="shrink-0"
                    >
                      <img
                        src={commentUser?.avatar ?? '/img/detalle-de-receta-1-04.jpg'}
                        alt=""
                        className="size-10 rounded-full object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to={commentAuthorPath}
                          className="truncate text-sm font-bold transition-colors hover:text-primary"
                        >
                          {commentUser?.name ?? 'Cocinero'}
                        </Link>
                        <span className="shrink-0 text-[11px] text-muted dark:text-gray-500">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted dark:text-gray-300">
                        {comment.text}
                      </p>
                      <div className="mt-1 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => toggleCommentLike(comment.id)}
                          aria-pressed={comment.likedByMe}
                          aria-label={
                            comment.likedByMe
                              ? `Quitar me gusta al comentario de ${commentUser?.name ?? 'este cocinero'}`
                              : `Dar me gusta al comentario de ${commentUser?.name ?? 'este cocinero'}`
                          }
                          className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                            comment.likedByMe
                              ? 'text-primary'
                              : 'text-muted hover:text-primary dark:text-gray-400'
                          }`}
                        >
                          <Icon
                            name="thumb_up"
                            className="text-[15px]"
                            filled={comment.likedByMe}
                          />
                          {formatCount(comment.likes)}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReply(commentUser?.username ?? '')}
                          disabled={!commentUser}
                          className="text-[11px] font-semibold text-muted transition-colors hover:text-primary disabled:opacity-50 dark:text-gray-400"
                        >
                          Responder
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      </div>

      <Toast message={toast} />

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-line bg-surface/90 p-3 pb-safe backdrop-blur-lg dark:border-white/10 dark:bg-surface-dark/90"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={composerText}
              onChange={(event) => setComposerText(event.target.value)}
              placeholder="Añade un comentario..."
              maxLength={280}
              aria-label="Añade un comentario"
              className="w-full rounded-full border border-line bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/40 dark:border-white/10 dark:bg-white/5"
            />
            <Icon
              name="mood"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={!composerText.trim()}
            aria-label="Enviar comentario"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 disabled:opacity-40"
          >
            <Icon name="send" filled className="text-[20px]" />
          </button>
        </div>
      </form>
    </div>
  )
}
