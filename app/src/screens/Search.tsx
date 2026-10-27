import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { EmptyState } from '../components/EmptyState'
import { FilterChip } from '../components/FilterChip'
import { IconButton } from '../components/IconButton'
import { RecipeCard } from '../components/RecipeCard'
import { SearchField } from '../components/SearchField'
import {
  DIFFICULTY_FILTERS,
  SORT_OPTIONS,
  TIME_FILTERS,
  collectTags,
  filterRecipes,
  recipeCountLabel,
  sortRecipes,
} from '../lib/recipeFilters'
import type { SortOption, TimeFilter } from '../lib/recipeFilters'
import { useAppStore, useUnreadNotifications } from '../store/useAppStore'
import type { Difficulty } from '../types'

export function Search() {
  const recipes = useAppStore((state) => state.recipes)
  const users = useAppStore((state) => state.users)
  const unreadCount = useUnreadNotifications()
  const [query, setQuery] = useState('')
  const [time, setTime] = useState<TimeFilter>('any')
  const [difficulty, setDifficulty] = useState<Difficulty | 'any'>('any')
  const [tag, setTag] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('popular')

  const tags = useMemo(() => collectTags(recipes).slice(0, 12), [recipes])

  const results = useMemo(() => {
    const filtered = filterRecipes({
      recipes,
      users,
      query,
      time,
      difficulty,
      tag,
    })
    return sortRecipes(filtered, sort)
  }, [recipes, users, query, time, difficulty, tag, sort])

  const hasFilters =
    query.trim() !== '' || time !== 'any' || difficulty !== 'any' || tag !== null

  function clearFilters() {
    setQuery('')
    setTime('any')
    setDifficulty('any')
    setTag(null)
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Explorar</h1>
            <p className="text-xs text-muted dark:text-gray-400">
              Encuentra tu próxima receta
            </p>
          </div>
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

        <div role="search" className="px-4 pb-3">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="¿Qué quieres cocinar hoy?"
            label="Buscar recetas"
          />
        </div>
      </header>

      <section aria-label="Filtros de búsqueda" className="flex flex-col gap-3 px-4 pt-3">
        <FilterGroup label="Tiempo de preparación">
          {TIME_FILTERS.map((option) => (
            <FilterChip
              key={option.value}
              active={time === option.value}
              onClick={() => setTime(option.value)}
              icon={option.value === 'any' ? undefined : 'timer'}
            >
              {option.label}
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

        {tags.length > 0 ? (
          <FilterGroup label="Etiquetas">
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
        ) : null}

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm font-bold">Orden</span>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {SORT_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                active={sort === option.value}
                onClick={() => setSort(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Resultados" className="mt-4 px-4 pb-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">
              {hasFilters ? 'Resultados' : 'Resultados populares'}
            </h2>
            <p
              aria-live="polite"
              className="text-xs text-muted dark:text-gray-400"
            >
              {recipeCountLabel(results.length)}
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

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {results.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="search_off"
            title="No encontramos recetas"
            description="Prueba con otra palabra o quita algún filtro para ver más resultados."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="mt-1 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
              >
                Limpiar filtros
              </button>
            }
          />
        )}
      </section>
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
