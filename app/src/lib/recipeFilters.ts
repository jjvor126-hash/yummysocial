import type { Difficulty, Recipe, User } from '../types'

export type TimeFilter = 'any' | 'under30' | '30to60' | 'over60'
export type SortOption = 'recent' | 'popular' | 'rated'

export const TIME_FILTERS: ReadonlyArray<{ value: TimeFilter; label: string }> = [
  { value: 'any', label: 'Cualquier tiempo' },
  { value: 'under30', label: 'Menos de 30 min' },
  { value: '30to60', label: '30–60 min' },
  { value: 'over60', label: 'Más de 60 min' },
]

export const DIFFICULTY_FILTERS: ReadonlyArray<{ value: Difficulty | 'any'; label: string }> = [
  { value: 'any', label: 'Todas' },
  { value: 'Fácil', label: 'Fácil' },
  { value: 'Media', label: 'Media' },
  { value: 'Difícil', label: 'Difícil' },
]

export const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: 'recent', label: 'Recientes' },
  { value: 'popular', label: 'Populares' },
  { value: 'rated', label: 'Mejor valoradas' },
]

type FilterOptions = {
  recipes: Recipe[]
  users: User[]
  query?: string
  difficulty?: Difficulty | 'any'
  time?: TimeFilter
  tag?: string | null
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesTime(minutes: number, time: TimeFilter): boolean {
  switch (time) {
    case 'under30':
      return minutes < 30
    case '30to60':
      return minutes >= 30 && minutes <= 60
    case 'over60':
      return minutes > 60
    default:
      return true
  }
}

export function collectTags(recipes: Recipe[]): string[] {
  const counts = new Map<string, number>()

  for (const recipe of recipes) {
    for (const tag of recipe.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
    .map(([tag]) => tag)
}

export function filterRecipes({
  recipes,
  users,
  query = '',
  difficulty = 'any',
  time = 'any',
  tag = null,
}: FilterOptions): Recipe[] {
  const tokens = normalize(query).trim().split(/\s+/).filter(Boolean)
  const usersById = new Map(users.map((user) => [user.id, user]))

  return recipes.filter((recipe) => {
    if (difficulty !== 'any' && recipe.difficulty !== difficulty) return false
    if (!matchesTime(recipe.timeMinutes, time)) return false
    if (tag && !recipe.tags.includes(tag)) return false
    if (tokens.length === 0) return true

    const author = usersById.get(recipe.authorId)
    const haystack = normalize(
      [
        recipe.title,
        recipe.description,
        recipe.tags.join(' '),
        author?.name ?? '',
        author?.username ?? '',
        recipe.ingredients.map((ingredient) => ingredient.name).join(' '),
      ].join(' '),
    )

    return tokens.every((token) => haystack.includes(token))
  })
}

export function sortRecipes(
  recipes: Recipe[],
  sort: SortOption,
  dateKey: 'createdAt' | 'savedAt' = 'createdAt',
): Recipe[] {
  const newestFirst = (a: Recipe, b: Recipe) => {
    const dateA = dateKey === 'savedAt' ? (a.savedAt ?? a.createdAt) : a.createdAt
    const dateB = dateKey === 'savedAt' ? (b.savedAt ?? b.createdAt) : b.createdAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  }

  return [...recipes].sort((a, b) => {
    if (sort === 'popular' && b.likes !== a.likes) return b.likes - a.likes
    if (sort === 'rated' && b.rating !== a.rating) return b.rating - a.rating
    if (sort === 'rated' && b.ratingCount !== a.ratingCount) {
      return b.ratingCount - a.ratingCount
    }
    return newestFirst(a, b)
  })
}

export function recipeCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'receta' : 'recetas'}`
}
