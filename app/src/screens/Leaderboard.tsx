import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { RankingTabs } from '../components/RankingTabs'
import { SegmentedControl } from '../components/SegmentedControl'
import {
  CHEF_SORT_OPTIONS,
  buildChefRanking,
  chefMetricMeta,
  chefRecipeLabel,
} from '../lib/rankings'
import { profilePath } from '../lib/profiles'
import type { ChefRankingEntry, ChefSort } from '../lib/rankings'
import { formatCount } from '../lib/time'
import { useAppStore, useCurrentUser } from '../store/useAppStore'

const PODIUM_RING: Record<number, string> = {
  1: 'border-primary shadow-lg shadow-primary/30',
  2: 'border-[#c0c0c0]',
  3: 'border-[#cd7f32]',
}

const PODIUM_SIZE: Record<number, string> = {
  1: 'size-24',
  2: 'size-20',
  3: 'size-20',
}

const PODIUM_BADGE: Record<number, string> = {
  1: 'bg-primary',
  2: 'bg-[#a9a9a9]',
  3: 'bg-[#cd7f32]',
}

const PODIUM_ORDER: Record<number, string> = {
  1: 'order-2 -mt-8',
  2: 'order-1',
  3: 'order-3',
}

export function Leaderboard() {
  const users = useAppStore((state) => state.users)
  const recipes = useAppStore((state) => state.recipes)
  const currentUser = useCurrentUser()
  const [sort, setSort] = useState<ChefSort>('stars')

  const ranking = useMemo(
    () =>
      buildChefRanking({
        users,
        recipes,
        sort,
        currentUserId: currentUser?.id,
      }),
    [users, recipes, sort, currentUser?.id],
  )

  const podium = ranking.slice(0, 3)
  const me = ranking.find((entry) => entry.isCurrentUser)
  const showFooter = Boolean(me && me.position > 3)
  const rest = ranking
    .slice(3)
    .filter((entry) => !(showFooter && entry.isCurrentUser))
  const activeLabel = CHEF_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Estrellas'
  const meta = chefMetricMeta(sort)

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
            <h1 className="truncate text-xl font-extrabold tracking-tight">Clasificación</h1>
            <p className="truncate text-xs text-muted dark:text-gray-400">
              Top por {activeLabel.toLowerCase()}
            </p>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-primary/10">
            <Icon name="leaderboard" className="text-[22px]" />
          </span>
        </div>

        <div className="px-4 pb-3">
          <RankingTabs />
        </div>
      </header>

      <main className={`flex-1 px-0 pt-4 ${showFooter ? 'pb-44' : 'pb-10'}`}>
        <section className="px-4">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-primary">
            ¡Maestros del Sabor!
          </h2>
          <p className="mt-1 text-center text-sm font-medium text-muted dark:text-gray-400">
            Los chefs que están dominando la cocina.
          </p>
        </section>

        <section aria-label="Ordenar clasificación" className="mt-4 px-4">
          <SegmentedControl
            label="Ordenar clasificación"
            value={sort}
            options={CHEF_SORT_OPTIONS}
            onChange={setSort}
          />
        </section>

        {podium.length === 3 ? <Podium entries={podium} sort={sort} /> : null}

        {rest.length > 0 ? (
          <section aria-label="Resto de la clasificación" className="mt-5 px-4">
            <div className="rounded-3xl border border-line bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
              <ol className="space-y-2">
                {rest.map((entry) => (
                  <ChefRow key={entry.user.id} entry={entry} sort={sort} />
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {podium.length < 3 && ranking.length > 0 ? (
          <section aria-label="Clasificación de chefs" className="mt-5 px-4">
            <div className="rounded-3xl border border-line bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
              <ol className="space-y-2">
                {ranking.map((entry) => (
                  <ChefRow key={entry.user.id} entry={entry} sort={sort} />
                ))}
              </ol>
            </div>
          </section>
        ) : null}
      </main>

      {showFooter && me ? (
        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-surface via-surface/95 to-transparent px-4 pb-safe pt-8 dark:from-surface-dark dark:via-surface-dark/95">
          <Link
            to="/profile"
            aria-label="Ver tu perfil"
            className="flex items-center gap-3 rounded-2xl bg-primary p-3 text-white shadow-[0_8px_30px_rgba(238,140,43,0.4)] transition-transform active:scale-[0.99]"
          >
            <span className="w-6 shrink-0 text-center text-sm font-bold text-white/90">
              {me.position}
            </span>
            <img
              src={me.user.avatar}
              alt=""
              className="size-10 shrink-0 rounded-full border-2 border-white/40 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Tú</p>
              <p className="truncate text-[11px] text-white/80">
                {me.rank.current.name} · {chefRecipeLabel(me.recipeCount)}
              </p>
            </div>
            <div className="flex items-center gap-1 pr-1 text-sm font-bold">
              <Icon name={meta.icon} className="text-[16px]" filled={meta.icon === 'star'} />
              {formatCount(me.metric)}
            </div>
            <Icon name="arrow_forward" className="text-[18px] text-white/80" />
          </Link>
        </div>
      ) : null}
    </div>
  )
}

function Podium({ entries, sort }: { entries: ChefRankingEntry[]; sort: ChefSort }) {
  const meta = chefMetricMeta(sort)

  return (
    <section aria-label="Podio de chefs" className="mt-4 px-4">
      <ol className="flex items-end justify-center gap-2 pt-6">
        {entries.map((entry) => (
          <li
            key={entry.user.id}
            className={`w-1/3 ${PODIUM_ORDER[entry.position] ?? ''}`}
          >
            <Link
              to={profilePath(entry.user)}
              aria-label={`Ver el perfil de ${entry.user.name}`}
              className="flex w-full flex-col items-center rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
            >
              {entry.position === 1 ? (
                <Icon
                  name="workspace_premium"
                  filled
                  className="mb-1 text-[26px] text-primary"
                />
              ) : (
                <span aria-hidden="true" className="mb-1 h-[26px]" />
              )}

              <div
                className={`relative rounded-full border-[3px] bg-white p-1 dark:bg-card-dark ${
                  PODIUM_RING[entry.position] ?? ''
                } ${PODIUM_SIZE[entry.position] ?? 'size-20'}`}
              >
                <img
                  src={entry.user.avatar}
                  alt=""
                  className="size-full rounded-full object-cover"
                />
                <span
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-surface px-2 py-0.5 text-[11px] font-bold text-white dark:border-surface-dark ${
                    PODIUM_BADGE[entry.position] ?? 'bg-primary'
                  }`}
                >
                  {entry.position}
                </span>
              </div>

              <p
                className={`mt-3 w-full truncate text-center font-bold ${
                  entry.position === 1 ? 'text-base' : 'text-sm'
                }`}
              >
                {entry.user.name}
              </p>
              <p className="mt-0.5 w-full truncate text-center text-[10px] font-medium text-muted dark:text-gray-400">
                {entry.rank.current.name}
              </p>
              <p className="w-full truncate text-center text-[10px] text-muted dark:text-gray-500">
                {chefRecipeLabel(entry.recipeCount)}
              </p>

              <div className="mt-1 flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary dark:bg-primary/10">
                <Icon name={meta.icon} className="text-[13px]" filled={meta.icon === 'star'} />
                {formatCount(entry.metric)}
              </div>

              {entry.isCurrentUser ? (
                <span className="mt-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  Tú
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

function ChefRow({ entry, sort }: { entry: ChefRankingEntry; sort: ChefSort }) {
  const meta = chefMetricMeta(sort)

  return (
    <li>
      <Link
        to={profilePath(entry.user)}
        aria-label={`Ver el perfil de ${entry.user.name}`}
        className={`flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors ${
          entry.isCurrentUser
            ? 'bg-primary/10 ring-1 ring-primary/30 hover:bg-primary/15'
            : 'bg-surface/80 hover:bg-primary-soft/60 dark:bg-white/5 dark:hover:bg-white/10'
        }`}
      >
        <span className="w-6 shrink-0 text-center text-sm font-bold text-muted dark:text-gray-500">
          {entry.position}
        </span>
        <img
          src={entry.user.avatar}
          alt=""
          className="size-12 shrink-0 rounded-full border border-white object-cover dark:border-white/10"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold">{entry.user.name}</p>
            {entry.isCurrentUser ? (
              <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Tú
              </span>
            ) : null}
          </div>
          <p className="flex flex-wrap items-center gap-x-1 text-[10px] font-medium text-muted dark:text-gray-400">
            <span>{entry.rank.current.name}</span>
            <span aria-hidden="true">·</span>
            <span>{chefRecipeLabel(entry.recipeCount)}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1 text-sm font-bold">
            <Icon name={meta.icon} className="text-[16px] text-primary" filled={meta.icon === 'star'} />
            {formatCount(entry.metric)}
          </p>
          <p className="text-[10px] text-muted dark:text-gray-500">{meta.label}</p>
        </div>
      </Link>
    </li>
  )
}
