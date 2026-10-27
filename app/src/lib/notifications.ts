import type { AppNotification, NotificationType, Recipe, User } from '../types'

export type NotificationFilter = 'all' | 'unread' | 'mention' | 'system'

export const NOTIFICATION_FILTERS: ReadonlyArray<{
  value: NotificationFilter
  label: string
}> = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Sin leer' },
  { value: 'mention', label: 'Menciones' },
  { value: 'system', label: 'Sistema' },
]

export const NOTIFICATION_META: Record<
  NotificationType,
  { icon: string; badgeClass: string; label: string }
> = {
  like: {
    icon: 'favorite',
    badgeClass: 'bg-red-500 text-white',
    label: 'Me gusta',
  },
  comment: {
    icon: 'chat_bubble',
    badgeClass: 'bg-primary text-white',
    label: 'Comentario',
  },
  follow: {
    icon: 'person_add',
    badgeClass: 'bg-emerald-500 text-white',
    label: 'Nuevo seguidor',
  },
  mention: {
    icon: 'alternate_email',
    badgeClass: 'bg-indigo-500 text-white',
    label: 'Mención',
  },
  system: {
    icon: 'auto_awesome',
    badgeClass: 'bg-amber-400 text-white',
    label: 'Sistema',
  },
}

const ACTION_BY_TYPE: Record<NotificationType, string> = {
  like: 'le gustó tu receta',
  comment: 'comentó tu receta',
  follow: 'empezó a seguirte',
  mention: 'te mencionó en',
  system: '',
}

export type NotificationDetails = {
  actor: User | null
  recipe: Recipe | null
  action: string
  quote: string | null
}

export function describeNotification(
  notification: AppNotification,
  users: User[],
  recipes: Recipe[],
): NotificationDetails {
  return {
    actor: notification.userId
      ? (users.find((user) => user.id === notification.userId) ?? null)
      : null,
    recipe: notification.recipeId
      ? (recipes.find((recipe) => recipe.id === notification.recipeId) ?? null)
      : null,
    action: ACTION_BY_TYPE[notification.type],
    quote: notification.message?.trim() || null,
  }
}

export type NotificationGroup = {
  label: string
  items: AppNotification[]
}

export function groupNotificationsByDay(notifications: AppNotification[]): NotificationGroup[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  ).getTime()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime()

  const buckets: NotificationGroup[] = [
    { label: 'Hoy', items: [] },
    { label: 'Ayer', items: [] },
    { label: 'Esta semana', items: [] },
    { label: 'Anteriores', items: [] },
  ]

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  for (const notification of sorted) {
    const time = new Date(notification.createdAt).getTime()
    if (time >= startOfToday) buckets[0].items.push(notification)
    else if (time >= startOfYesterday) buckets[1].items.push(notification)
    else if (time >= startOfWeek) buckets[2].items.push(notification)
    else buckets[3].items.push(notification)
  }

  return buckets.filter((bucket) => bucket.items.length > 0)
}

export function filterNotifications(
  notifications: AppNotification[],
  filter: NotificationFilter,
): AppNotification[] {
  switch (filter) {
    case 'unread':
      return notifications.filter((notification) => !notification.read)
    case 'mention':
      return notifications.filter((notification) => notification.type === 'mention')
    case 'system':
      return notifications.filter((notification) => notification.type === 'system')
    default:
      return notifications
  }
}
