import type { Subscription, SubscriptionPlan } from '../types'

export type PremiumPlan = {
  id: SubscriptionPlan
  name: string
  price: string
  period: string
  days: number
  note?: string
  popular?: boolean
}

/** Planes de la suscripción demo. No hay cobro real. */
export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'monthly',
    name: 'Mensual',
    price: '4,99 €',
    period: 'al mes',
    days: 30,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: '39,99 €',
    period: 'al año',
    days: 365,
    note: 'Ahorra un 33 %',
    popular: true,
  },
]

export const PREMIUM_BENEFITS: Array<{ icon: string; text: string }> = [
  { icon: 'lock_open', text: 'Abre todos los secretos de cualquier receta, sin esperar al nivel.' },
  { icon: 'workspace_premium', text: 'Insignia Yummy+ junto a tu nombre en tu perfil.' },
  { icon: 'restaurant', text: 'Apoyas a los chefs que comparten sus trucos.' },
  { icon: 'auto_awesome', text: 'Acceso inmediato, también a los secretos solo Yummy+.' },
]

export function planById(plan: SubscriptionPlan): PremiumPlan {
  return PREMIUM_PLANS.find((option) => option.id === plan) ?? PREMIUM_PLANS[0]
}

export function isSubscriptionActive(
  subscription: Subscription | null | undefined,
  now = Date.now(),
): boolean {
  if (!subscription) return false
  const end = new Date(subscription.renewsAt).getTime()
  return Number.isFinite(end) && end > now
}

export function subscriptionEndLabel(subscription: Subscription | null | undefined): string {
  if (!subscription) return ''
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(subscription.renewsAt))
}

export function subscriptionPlanLabel(subscription: Subscription | null | undefined): string {
  if (!subscription) return ''
  return `Plan ${planById(subscription.plan).name.toLowerCase()}`
}
