import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { FilterChip } from '../components/FilterChip'
import { IconButton } from '../components/IconButton'
import { RecipeCard } from '../components/RecipeCard'
import { SearchField } from '../components/SearchField'
import { Toast } from '../components/Toast'
import {
  SORT_OPTIONS,
  collectTags,
  filterRecipes,
  recipeCountLabel,
  sortRecipes,
} from '../lib/recipeFilters'
import type { SortOption } from '../lib/recipeFilters'
import { useToast } from '../lib/useToast'
import { useAppStore, useUnreadNotifications } from '../store/useAppStore'

export function Saved() {
  const recipes = useAppStore((state) => state.recipes)
  const users = useAppStore((state) => state.users)
  const toggleSave = useAppStore((state) => state.toggleSave)
  const unreadCount = useUnreadNotifications()
  const { message: toast, showToast } = useToast()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('recent')

  const savedRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.savedByMe),
    [recipes],
  )

  const tags = useMemo(() => collectTags(savedRecipes).slice(0, 12), [savedRecipes])

  const results = useMemo(() => {
    const filtered = filterRecipes({ recipes: savedRecipes, users, query, tag })
    return sortRecipes(filtered, sort, 'savedAt')
  }, [savedRecipes, users, query, tag, sort])

  const hasFilters = query.trim() !== '' || tag !== null

  function clearFilters() {
    setQuery('')
    setTag(null)
  }

  function removeRecipe(id: string, title: string) {
    toggleSave(id)
    showToast(`«${title}» quitada de guardadas`)
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Guardadas</h1>
            <p className="text-xs text-muted dark:text-gray-400">
              {recipeCountLabel(savedRecipes.length)}
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

        {savedRecipes.length > 0 ? (
          <div role="search" className="px-4 pb-3">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Buscar en mis recetas…"
              label="Buscar en recetas guardadas"
            />
          </div>
        ) : null}
      </header>

      {savedRecipes.length === 0 ? (
        <div className="px-4 py-4">
          <EmptyState
            icon="bookmark"
            title="Todavía no guardas recetas"
            description="Toca el marcador en una receta para tenerla siempre a mano."
            action={
              <Link
                to="/search"
                className="mt-1 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
              >
                Explorar recetas
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <section aria-label="Filtros de guardadas" className="flex flex-col gap-3 px-4 pt-3">
            {tags.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-bold leading-tight">Etiquetas</h2>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
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
                </div>
              </div>
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

          <section aria-label="Recetas guardadas" className="mt-4 px-4 pb-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p
                aria-live="polite"
                className="text-xs font-semibold text-muted dark:text-gray-400"
              >
                {recipeCountLabel(results.length)}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {results.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onRemove={() => removeRecipe(recipe.id, recipe.title)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="bookmark_remove"
                title="Ninguna guardada coincide"
                description="Tu búsqueda o los filtros no coinciden con las recetas que has guardado."
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
        </>
      )}

      <Toast message={toast} />
    </div>
  )
}
