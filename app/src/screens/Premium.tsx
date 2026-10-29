import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { StarGuide } from '../components/StarGuide'
import { Toast } from '../components/Toast'
import { useToast } from '../lib/useToast'
import { getRank } from '../lib/ranks'
import {
  PREMIUM_BENEFITS,
  PREMIUM_PLANS,
  isSubscriptionActive,
  planById,
  subscriptionEndLabel,
  subscriptionPlanLabel,
} from '../lib/subscription'
import { useAppStore, useCurrentUser } from '../store/useAppStore'
import type { SubscriptionPlan } from '../types'

export function Premium() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useCurrentUser()
  const subscription = useAppStore((state) => state.subscription)
  const subscribe = useAppStore((state) => state.subscribe)
  const cancelSubscription = useAppStore((state) => state.cancelSubscription)
  const { message: toast, showToast } = useToast()

  const active = isSubscriptionActive(subscription)
  const [plan, setPlan] = useState<SubscriptionPlan>(subscription?.plan ?? 'annual')
  const rank = getRank(user?.stars ?? 0)

  function handleBack() {
    if (location.key === 'default') {
      navigate('/profile')
      return
    }
    navigate(-1)
  }

  function handleSubscribe() {
    if (active) return
    const selected = planById(plan)
    const confirmed = window.confirm(
      `¿Activar Yummy+ ${selected.name.toLowerCase()} por ${selected.price} ${selected.period}?\n\nEsto es una demo: no se realiza ningún cobro real.`,
    )
    if (!confirmed) return

    subscribe(plan)
    showToast('Yummy+ activado')
  }

  function handleCancel() {
    const confirmed = window.confirm(
      '¿Cancelar Yummy+? Los secretos exclusivos volverán a bloquearse.',
    )
    if (!confirmed) return

    cancelSubscription()
    showToast('Suscripción cancelada')
  }

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-surface/90 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Volver"
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon name="arrow_back" />
        </button>
        <h1 className="flex-1 pr-10 text-center text-lg font-bold tracking-tight">Yummy+</h1>
      </header>

      <div className="flex flex-col gap-5 px-4 pt-4">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#c026d3] p-5 text-white shadow-xl shadow-purple-900/20">
          <div className="absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 size-32 rounded-full bg-black/20 blur-2xl" />

          <div className="relative flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Icon name="workspace_premium" filled className="text-[24px]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Suscripción
            </span>
          </div>

          <h2 className="relative mt-3 text-3xl font-extrabold leading-tight tracking-tight">
            {active ? 'Yummy+ está activo' : 'Abre todos los secretos'}
          </h2>
          <p className="relative mt-2 max-w-[300px] text-sm leading-relaxed text-white/85">
            {active
              ? `${subscriptionPlanLabel(subscription)} · hasta el ${subscriptionEndLabel(subscription)}.`
              : 'Los ingredientes y pasos secretos dejan de ser un misterio. Sin esperar a subir de nivel.'}
          </p>

          <div className="relative mt-4 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
            <Icon name="verified" filled className="text-[15px]" />
            Insignia Yummy+ en tu perfil
          </div>
        </section>

        <section aria-labelledby="beneficios-title">
          <h2 id="beneficios-title" className="mb-2 px-1 text-base font-bold">
            Qué incluye
          </h2>
          <ul className="flex flex-col gap-2">
            {PREMIUM_BENEFITS.map((benefit) => (
              <li
                key={benefit.text}
                className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-white/5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                  <Icon name={benefit.icon} className="text-[18px]" />
                </span>
                <span className="pt-1 text-sm leading-relaxed text-muted dark:text-gray-300">
                  {benefit.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {active ? (
          <section className="rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/30 dark:bg-purple-900/20">
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Icon name="check_circle" filled className="text-[20px]" />
              <p className="text-sm font-bold">Suscripción activa</p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-purple-700 dark:text-purple-300">
              {subscriptionPlanLabel(subscription)} · renueva el{' '}
              {subscriptionEndLabel(subscription)}. Todos los secretos están desbloqueados.
            </p>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-purple-300 bg-white/70 text-sm font-bold text-purple-700 transition-colors hover:bg-white dark:border-purple-500/40 dark:bg-white/5 dark:text-purple-200 dark:hover:bg-white/10"
            >
              Cancelar suscripción
            </button>
          </section>
        ) : (
          <section aria-labelledby="planes-title">
            <h2 id="planes-title" className="mb-2 px-1 text-base font-bold">
              Elige tu plan
            </h2>
            <div className="grid gap-2">
              {PREMIUM_PLANS.map((option) => {
                const selected = option.id === plan
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPlan(option.id)}
                    aria-pressed={selected}
                    className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                      selected
                        ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20'
                        : 'border-transparent bg-white hover:border-purple-200 dark:bg-white/5 dark:hover:border-purple-500/30'
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-line dark:border-white/20'
                      }`}
                    >
                      {selected ? <Icon name="check" className="text-[13px]" /> : null}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-bold">{option.name}</span>
                        {option.popular ? (
                          <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            Ahorra
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted dark:text-gray-400">
                        {option.note ?? 'Cancela cuando quieras'}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-lg font-extrabold leading-none">
                        {option.price}
                      </span>
                      <span className="text-[11px] text-muted dark:text-gray-400">
                        {option.period}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleSubscribe}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-base font-bold text-white shadow-lg shadow-purple-600/25 transition-transform active:scale-[0.98]"
            >
              <Icon name="workspace_premium" filled className="text-[20px]" />
              Activar Yummy+ · {planById(plan).price}
            </button>
          </section>
        )}

        <section aria-labelledby="nivel-title">
          <div className="mb-2 flex items-end justify-between gap-2 px-1">
            <h2 id="nivel-title" className="text-base font-bold">
              O sube de nivel gratis
            </h2>
            <span className="text-[11px] font-semibold text-primary">
              {rank.current.name} · Lvl {rank.level}
            </span>
          </div>
          <p className="mb-3 px-1 text-xs leading-relaxed text-muted dark:text-gray-400">
            Publicar, comentar y recibir interacción suma estrellas. Cada secreto indica el nivel
            que necesita.
          </p>
          <StarGuide />
        </section>

        <p className="rounded-xl bg-white/70 px-3 py-2.5 text-center text-[11px] leading-relaxed text-muted dark:bg-white/5 dark:text-gray-400">
          Demo local: la suscripción es simulada y no se realiza ningún cobro real. Se guarda en
          este dispositivo y se borra al restablecer la demo.
        </p>
      </div>

      <Toast message={toast} />
    </div>
  )
}
