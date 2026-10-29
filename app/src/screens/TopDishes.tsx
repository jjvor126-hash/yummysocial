import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { FilterChip } from '../components/FilterChip'
import { Icon } from '../components/Icon'
import { RankingTabs } from '../components/RankingTabs'
import { SegmentedControl } from '../components/SegmentedControl'
import { profilePath } from '../lib/profiles'
import { DIFFICULTY_FILTERS } from '../lib/recipeFilters'
import {
  DISH_SORT_OPTIONS,
  buildDishRanking,
  collectDishTags,
  dishCountLabel,
} from '../lib/rankings'
import type { DishRankingEntry, DishSort } from '../lib/rankings'
import { formatCount } from '../lib/time'
import { useAppStore } from '../store/useAppStore'
import type { Difficulty } from '../types'

const PODIUM_BORDER: Record<number, string> = {
  1: 'border-[#f2c94c] shadow-xl shadow-primary/20',
  2: 'border-[#c0c0c0] shadow-lg',
  3: 'border-[#cd7f32] shadow-lg',
}

const PODIUM_SIZE: Record<number, string> = {
  1: 'size-24',
  2: 'size-20',
  3: 'size-20',
}

const PODIUM_BADGE: Record<number, string> = {
  1: 'bg-[#f2c94c] text-[#7a6200]',
  2: 'bg-[#c0c0c0] text-white',
  3: 'bg-[#cd7f32] text-white',
}

const PODIUM_ORDER: Record<number, string> = {
  1: 'order-2 -mt-7',
  2: 'order-1',
  3: 'order-3',
}

export function TopDishes() {
  const recipes = useAppStore((state) => state.recipes)
  const users = useAppStore((state) => state.users)
  const [sort, setSort] = useState<DishSort>('rated')
  const [tag, setTag] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty | 'any'>('any')

  const tags = useMemo(() => collectDishTags(recipes).slice(0, 10), [recipes])

  const results = useMemo(
    () => buildDishRanking({ recipes, users, tag, difficulty, sort }),
    [recipes, users, tag, difficulty, sort],
  )

  const hasFilters = tag !== null || difficulty !== 'any'
  const podiumEntries = results.length >= 3 ? results.slice(0, 3) : []
  const listEntries = results.length >= 3 ? results.slice(3) : results

  function clearFilters() {
    setTag(null)
    setDifficulty('any')
  }

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
            <h1 className="truncate text-xl font-extrabold tracking-tight">Ranking de sabor</h1>
            <p className="truncate text-xs text-muted dark:text-gray-400">
              Los platos mejor valorados
            </p>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-primary/10">
            <Icon name="restaurant" className="text-[22px]" />
          </span>
        </div>

        <div className="px-4 pb-3">
          <RankingTabs />
        </div>
      </header>

      <main className="flex-1 pb-10">
        <section aria-label="Filtros y orden" className="flex flex-col gap-3 px-4 pt-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold leading-tight">Ordenar por</h2>
            <SegmentedControl
              label="Ordenar platos"
              value={sort}
              options={DISH_SORT_OPTIONS}
              onChange={setSort}
              showIcons={false}
            />
          </div>

          <FilterGroup label="Categoría">
            <FilterChip active={tag === null} onClick={() => setTag(null)}>
              Todas
            </FilterChip>
            {tags.map((option) => (
              <FilterChip
                key={option}
                active={tag === option}
                onClick={() => setTag(tag === option ? null : option)}
              >
                {option}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Dificultad">
            {DIFFICULTY_FILTERS.map((option) => (
              <FilterChip
                key={option.value}
                active={difficulty === option.value}
                onClick={() => setDifficulty(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </FilterGroup>
        </section>

        <div className="mt-4 flex items-end justify-between gap-3 px-4">
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">
              {hasFilters ? 'Resultados' : 'Mejores clasificados'}
            </h2>
            <p aria-live="polite" className="text-xs text-muted dark:text-gray-400">
              {dishCountLabel(results.length)}
            </p>
          </div>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mb-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>

        {podiumEntries.length === 3 ? (
          <section aria-label="Podio de platos" className="mt-2">
            <div className="px-4 text-center">
              <h2 className="flex items-center justify-center gap-1.5 text-2xl font-extrabold tracking-tight">
                <Icon name="workspace_premium" filled className="text-[24px] text-primary" />
                El Podio
              </h2>
              <p className="text-sm text-muted dark:text-gray-400">
                Los favoritos de la comunidad
              </p>
            </div>
            <DishPodium entries={podiumEntries} />
          </section>
        ) : null}

        {listEntries.length > 0 ? (
          <section aria-label="Lista del ranking" className="mt-4 px-4">
            <ol className="space-y-2">
              {listEntries.map((entry) => (
                <DishRow key={entry.recipe.id} entry={entry} />
              ))}
            </ol>
          </section>
        ) : null}

        {results.length === 0 ? (
          <div className="px-4 pt-4">
            <EmptyState
              icon={hasFilters ? 'filter_alt_off' : 'restaurant'}
              title={hasFilters ? 'No hay platos con esos filtros' : 'Aún no hay platos valorados'}
              description={
                hasFilters
                  ? 'Prueba con otra categoría o dificultad para ver más platos del ranking.'
                  : 'Cuando las recetas reciban estrellas de la comunidad, aparecerán en este ranking.'
              }
              action={
                hasFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-1 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
                  >
                    Limpiar filtros
                  </button>
                ) : (
                  <Link
                    to="/search"
                    className="mt-1 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
                  >
                    Explorar recetas
                  </Link>
                )
              }
            />
          </div>
        ) : null}
      </main>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold leading-tight">{label}</h2>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  )
}

function DishPodium({ entries }: { entries: DishRankingEntry[] }) {
  return (
    <ol className="mt-2 flex items-end justify-center gap-3 px-4 pb-2 pt-8">
      {entries.map((entry) => (
        <li
          key={entry.recipe.id}
          className={`flex w-1/3 flex-col items-center ${PODIUM_ORDER[entry.position] ?? ''}`}
        >
          <Link
            to={`/recipe/${entry.recipe.id}`}
            className="group flex w-full flex-col items-center rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
          >
            {entry.position === 1 ? (
              <Icon
                name="workspace_premium"
                filled
                className="mb-1 text-[26px] text-[#f2c94c]"
              />
            ) : (
              <span aria-hidden="true" className="mb-1 h-[26px]" />
            )}

            <div
              className={`relative rounded-full border-4 bg-white p-0.5 dark:bg-card-dark ${
                PODIUM_BORDER[entry.position] ?? ''
              } ${PODIUM_SIZE[entry.position] ?? 'size-20'}`}
            >
              <img
                src={entry.recipe.image}
                alt={entry.recipe.title}
                className="size-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-surface px-2 py-0.5 text-[11px] font-bold dark:border-surface-dark ${
                  PODIUM_BADGE[entry.position] ?? ''
                }`}
              >
                #{entry.position}
              </span>
            </div>

            <p
              className={`mt-3 line-clamp-2 w-full text-center font-bold leading-tight ${
                entry.position === 1 ? 'text-sm' : 'text-xs'
              }`}
            >
              {entry.recipe.title}
            </p>
          </Link>

          {entry.author ? (
            <Link
              to={profilePath(entry.author)}
              aria-label={`Ver el perfil de ${entry.author.name}`}
              className="mt-0.5 w-full truncate text-center text-[10px] text-muted transition-colors hover:text-primary dark:text-gray-400"
            >
              @{entry.author.username}
            </Link>
          ) : (
            <p className="mt-0.5 w-full truncate text-center text-[10px] text-muted dark:text-gray-400">
              @yummysocial
            </p>
          )}

          <p className="flex items-center gap-0.5 text-sm font-bold text-primary">
            {entry.recipe.rating.toFixed(1)}
            <Icon name="star" filled className="text-[13px]" />
          </p>
        </li>
      ))}
    </ol>
  )
}

function DishRow({ entry }: { entry: DishRankingEntry }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-line transition-colors hover:bg-primary-soft/60 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10">
      <span className="w-6 shrink-0 text-center text-sm font-bold text-muted dark:text-gray-500">
        {entry.position}
      </span>

      <Link
        to={`/recipe/${entry.recipe.id}`}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <img
          src={entry.recipe.image}
          alt={entry.recipe.title}
          loading="lazy"
          className="size-16 shrink-0 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-bold leading-tight">{entry.recipe.title}</p>
          <p className="mt-0.5 truncate text-[10px] text-muted dark:text-gray-500">
            {entry.recipe.difficulty} · {entry.recipe.timeMinutes} min
          </p>
        </div>
      </Link>

      <div className="flex min-w-0 shrink-0 flex-col items-end">
        {entry.author ? (
          <Link
            to={profilePath(entry.author)}
            aria-label={`Ver el perfil de ${entry.author.name}`}
            className="max-w-[110px] truncate text-xs text-muted transition-colors hover:text-primary dark:text-gray-400"
          >
            @{entry.author.username}
          </Link>
        ) : (
          <span className="max-w-[110px] truncate text-xs text-muted dark:text-gray-400">
            @yummysocial
          </span>
        )}
        <div className="mt-1 inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2 py-1 text-xs font-bold text-primary dark:bg-primary/10">
          <Icon name="star" filled className="text-[14px]" />
          {entry.recipe.rating.toFixed(1)}
        </div>
        <p className="mt-1 text-[10px] text-muted dark:text-gray-500">
          {formatCount(entry.recipe.ratingCount)} reseñas
        </p>
      </div>
    </li>
  )
}
