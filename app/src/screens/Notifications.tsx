import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { FilterChip } from '../components/FilterChip'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import {
  NOTIFICATION_FILTERS,
  NOTIFICATION_META,
  describeNotification,
  filterNotifications,
  groupNotificationsByDay,
} from '../lib/notifications'
import type { NotificationDetails, NotificationFilter } from '../lib/notifications'
import { timeAgo } from '../lib/time'
import { useToast } from '../lib/useToast'
import { useAppStore, useCurrentUser } from '../store/useAppStore'
import type { AppNotification, User } from '../types'

const FALLBACK_AVATAR = '/img/tabla-de-clasificaci-n-chefs-1-08.jpg'

const EMPTY_COPY: Record<
  NotificationFilter,
  { icon: string; title: string; description: string }
> = {
  all: {
    icon: 'notifications_off',
    title: 'Nada por aquí',
    description: 'Cuando alguien interactúe con tus recetas o contigo, lo verás aquí.',
  },
  unread: {
    icon: 'task_alt',
    title: 'Estás al día',
    description: 'No tienes notificaciones sin leer.',
  },
  mention: {
    icon: 'alternate_email',
    title: 'Sin menciones todavía',
    description: 'Cuando alguien te mencione en una receta, aparecerá aquí.',
  },
  system: {
    icon: 'auto_awesome',
    title: 'Sin novedades del sistema',
    description: 'Los retos y avisos de YummySocial se mostrarán en esta bandeja.',
  },
}

export function Notifications() {
  const notifications = useAppStore((state) => state.notifications)
  const users = useAppStore((state) => state.users)
  const recipes = useAppStore((state) => state.recipes)
  const markNotificationRead = useAppStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead)
  const toggleFollow = useAppStore((state) => state.toggleFollow)
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const { message: toast, showToast } = useToast()
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const visible = useMemo(
    () => filterNotifications(notifications, filter),
    [notifications, filter],
  )

  const groups = useMemo(() => groupNotificationsByDay(visible), [visible])

  function openNotification(notification: AppNotification) {
    if (!notification.read) markNotificationRead(notification.id)
    if (notification.recipeId) navigate(`/recipe/${notification.recipeId}`)
  }

  function handleFollow(user: User) {
    const wasFollowing = currentUser?.followingIds.includes(user.id) ?? false
    toggleFollow(user.id)
    showToast(
      wasFollowing ? `Dejaste de seguir a ${user.name}` : `Ahora sigues a ${user.name}`,
    )
  }

  function handleMarkAll() {
    if (unreadCount === 0) return
    markAllNotificationsRead()
    showToast('Todas las notificaciones marcadas como leídas')
  }

  const emptyCopy = EMPTY_COPY[filter]

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <div className="flex items-center gap-1 px-3 pb-2 pt-2">
          <Link
            to="/feed"
            aria-label="Volver al inicio"
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="arrow_back" />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold tracking-tight">
              Notificaciones
            </h1>
            <p className="text-xs text-muted dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition-colors ${
              unreadCount > 0
                ? 'text-primary hover:bg-primary/10'
                : 'cursor-default text-muted/60 dark:text-gray-600'
            }`}
          >
            Marcar todo
          </button>
        </div>

        <div
          role="group"
          aria-label="Filtrar notificaciones"
          className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3"
        >
          {NOTIFICATION_FILTERS.map((option) => {
            const count =
              option.value === 'all'
                ? notifications.length
                : option.value === 'unread'
                  ? unreadCount
                  : null

            return (
              <FilterChip
                key={option.value}
                active={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
                {count !== null ? ` (${count})` : ''}
              </FilterChip>
            )
          })}
        </div>
      </header>

      <main className="flex-1 pb-8">
        {groups.length === 0 ? (
          <div className="px-4 py-6">
            <EmptyState
              icon={emptyCopy.icon}
              title={emptyCopy.title}
              description={emptyCopy.description}
              action={
                filter === 'unread' ? (
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className="mt-1 rounded-full bg-primary-soft px-5 py-2.5 text-xs font-bold text-primary transition-transform active:scale-95 dark:bg-white/5"
                  >
                    Ver todas
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="px-4 pb-1.5 pt-4 text-[11px] font-bold uppercase tracking-wider text-muted dark:text-gray-500">
                {group.label}
              </h2>

              {group.items.map((notification) => {
                const details = describeNotification(notification, users, recipes)
                const actor = details.actor

                return notification.type === 'system' ? (
                  <SystemNotification
                    key={notification.id}
                    notification={notification}
                    onOpen={() => openNotification(notification)}
                  />
                ) : (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    details={details}
                    following={
                      actor ? (currentUser?.followingIds.includes(actor.id) ?? false) : false
                    }
                    onOpen={() => openNotification(notification)}
                    onFollow={actor ? () => handleFollow(actor) : undefined}
                  />
                )
              })}
            </section>
          ))
        )}

        {groups.length > 0 && unreadCount === 0 && filter !== 'unread' ? (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
            <Icon name="check_circle" className="text-[26px] text-primary" />
            <p className="text-sm font-bold">Estás al día</p>
            <p className="text-xs text-muted dark:text-gray-400">
              No tienes notificaciones sin leer.
            </p>
          </div>
        ) : null}
      </main>

      <Toast message={toast} />
    </div>
  )
}

function NotificationRow({
  notification,
  details,
  following,
  onOpen,
  onFollow,
}: {
  notification: AppNotification
  details: NotificationDetails
  following: boolean
  onOpen: () => void
  onFollow?: () => void
}) {
  const meta = NOTIFICATION_META[notification.type]
  const unread = !notification.read

  return (
    <div
      className={`relative flex items-stretch border-b border-line dark:border-white/10 ${
        unread ? 'bg-primary-soft/60 dark:bg-primary/10' : ''
      }`}
    >
      {unread ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary"
        />
      ) : null}

      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-4 pr-2 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/5"
      >
        <span className="relative shrink-0">
          <img
            src={details.actor?.avatar ?? FALLBACK_AVATAR}
            alt=""
            className="size-12 rounded-full border border-line object-cover dark:border-white/10"
          />
          <span
            className={`absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-surface dark:border-surface-dark ${meta.badgeClass}`}
          >
            <Icon name={meta.icon} className="text-[11px]" filled />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm leading-snug">
            <span className="font-bold">{details.actor?.name ?? 'Alguien'}</span>{' '}
            {details.action}
            {details.recipe ? (
              <>
                {' '}
                <span className="font-semibold text-primary">{details.recipe.title}</span>
              </>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-medium text-muted dark:text-gray-400">
            {timeAgo(notification.createdAt)}
            {details.quote ? ` · “${details.quote}”` : ''}
          </span>
          <span className="sr-only">
            {meta.label}
            {unread ? ', sin leer' : ', leída'}
          </span>
        </span>

        {details.recipe ? (
          <img
            src={details.recipe.image}
            alt=""
            className="size-12 shrink-0 rounded-lg object-cover shadow-sm"
          />
        ) : null}
      </button>

      {notification.type === 'follow' && onFollow ? (
        <div className="flex items-center pr-4">
          <button
            type="button"
            onClick={onFollow}
            aria-pressed={following}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors active:scale-95 ${
              following
                ? 'border border-line text-muted hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10'
                : 'bg-primary text-white shadow-sm shadow-primary/30'
            }`}
          >
            {following ? 'Siguiendo' : 'Seguir'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function SystemNotification({
  notification,
  onOpen,
}: {
  notification: AppNotification
  onOpen: () => void
}) {
  const unread = !notification.read

  return (
    <div className="px-4 py-2">
      <button
        type="button"
        onClick={onOpen}
        className={`relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
          unread
            ? 'border-amber-200 bg-amber-50 hover:bg-amber-100/80 dark:border-amber-400/30 dark:bg-amber-400/10 dark:hover:bg-amber-400/15'
            : 'border-amber-100/70 bg-amber-50/60 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
        }`}
      >
        {unread ? (
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 size-2 rounded-full bg-primary"
          />
        ) : null}

        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
          <Icon name="auto_awesome" className="text-[22px]" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Novedad de YummySocial
          </span>
          <span className="mt-1 block text-sm font-medium leading-snug">
            {notification.message ?? 'Tienes una novedad de la comunidad.'}
          </span>
          <span className="mt-1 block text-[11px] font-medium text-muted dark:text-gray-400">
            {timeAgo(notification.createdAt)}
            {unread ? ' · sin leer' : ''}
          </span>
        </span>
      </button>
    </div>
  )
}
