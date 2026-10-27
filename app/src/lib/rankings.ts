import { collectTags, recipeCountLabel } from './recipeFilters'
import { getRank } from './ranks'
import type { RankInfo } from './ranks'
import type { Difficulty, Recipe, User } from '../types'

export type ChefSort = 'stars' | 'trending' | 'followers'
export type DishSort = 'rated' | 'votes' | 'popular'

export type ChefRankingEntry = {
  user: User
  position: number
  rank: RankInfo
  recipeCount: number
  stars: number
  followers: number
  trendingLikes: number
  metric: number
  isCurrentUser: boolean
}

export type DishRankingEntry = {
  recipe: Recipe
  author?: User
  position: number
}

type ChefSortOption = { value: ChefSort; label: string; icon: string }
type DishSortOption = { value: DishSort; label: string; icon: string }

export const CHEF_SORT_OPTIONS: ReadonlyArray<ChefSortOption> = [
  { value: 'stars', label: 'Estrellas', icon: 'star' },
  { value: 'trending', label: 'Tendencias', icon: 'trending_up' },
  { value: 'followers', label: 'Seguidores', icon: 'group' },
]

export const DISH_SORT_OPTIONS: ReadonlyArray<DishSortOption> = [
  { value: 'rated', label: 'Mejor valoradas', icon: 'star' },
  { value: 'votes', label: 'Más votadas', icon: 'how_to_vote' },
  { value: 'popular', label: 'Populares', icon: 'favorite' },
]

/** Ventana usada para calcular las tendencias de un chef. */
export const TRENDING_WINDOW_DAYS = 7

const TRENDING_WINDOW_MS = TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000

export function chefMetricMeta(sort: ChefSort): { icon: string; label: string } {
  switch (sort) {
    case 'trending':
      return { icon: 'trending_up', label: `likes · ${TRENDING_WINDOW_DAYS} días` }
    case 'followers':
      return { icon: 'group', label: 'seguidores' }
    default:
      return { icon: 'star', label: 'estrellas' }
  }
}

export function buildChefRanking({
  users,
  recipes,
  sort,
  currentUserId,
}: {
  users: User[]
  recipes: Recipe[]
  sort: ChefSort
  currentUserId?: string | null
}): ChefRankingEntry[] {
  const now = Date.now()
  const stats = new Map<string, { recipeCount: number; trendingLikes: number }>()

  for (const recipe of recipes) {
    const current = stats.get(recipe.authorId) ?? { recipeCount: 0, trendingLikes: 0 }
    current.recipeCount += 1

    const age = now - new Date(recipe.createdAt).getTime()
    if (age >= 0 && age <= TRENDING_WINDOW_MS) {
      current.trendingLikes += recipe.likes
    }

    stats.set(recipe.authorId, current)
  }

  const entries: Array<Omit<ChefRankingEntry, 'position'>> = users.map((user) => {
    const stat = stats.get(user.id) ?? { recipeCount: 0, trendingLikes: 0 }
    const metric =
      sort === 'followers'
        ? user.followers
        : sort === 'trending'
          ? stat.trendingLikes
          : user.stars

    return {
      user,
      rank: getRank(user.stars),
      recipeCount: stat.recipeCount,
      stars: user.stars,
      followers: user.followers,
      trendingLikes: stat.trendingLikes,
      metric,
      isCurrentUser: user.id === currentUserId,
    }
  })

  entries.sort(
    (a, b) =>
      b.metric - a.metric ||
      b.recipeCount - a.recipeCount ||
      b.followers - a.followers ||
      a.user.name.localeCompare(b.user.name, 'es'),
  )

  return entries.map((entry, index) => ({ ...entry, position: index + 1 }))
}

export function isRatedDish(recipe: Recipe): boolean {
  return recipe.rating > 0 && recipe.ratingCount > 0
}

/** Etiquetas que funcionan como categoría principal en el ranking de platos. */
const DISH_CATEGORY_ORDER = [
  'Postre',
  'Italiano',
  'Mexicano',
  'Asiático',
  'Vegetariano',
  'Saludable',
  'Pasta',
  'Pizza',
  'Carne',
  'Pollo',
]

export function collectDishTags(recipes: Recipe[]): string[] {
  const available = new Set(collectTags(recipes.filter(isRatedDish)))
  return DISH_CATEGORY_ORDER.filter((tag) => available.has(tag))
}

export function buildDishRanking({
  recipes,
  users,
  tag = null,
  difficulty = 'any',
  sort = 'rated',
}: {
  recipes: Recipe[]
  users: User[]
  tag?: string | null
  difficulty?: Difficulty | 'any'
  sort?: DishSort
}): DishRankingEntry[] {
  const usersById = new Map(users.map((user) => [user.id, user]))

  const eligible = recipes.filter((recipe) => {
    if (!isRatedDish(recipe)) return false
    if (tag && !recipe.tags.includes(tag)) return false
    if (difficulty !== 'any' && recipe.difficulty !== difficulty) return false
    return true
  })

  eligible.sort((a, b) => {
    if (sort === 'votes' && b.ratingCount !== a.ratingCount) {
      return b.ratingCount - a.ratingCount
    }
    if (sort === 'popular' && b.likes !== a.likes) {
      return b.likes - a.likes
    }
    if (b.rating !== a.rating) return b.rating - a.rating
    if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount
    if (b.likes !== a.likes) return b.likes - a.likes
    return a.title.localeCompare(b.title, 'es')
  })

  return eligible.map((recipe, index) => ({
    recipe,
    author: usersById.get(recipe.authorId),
    position: index + 1,
  }))
}

export function dishCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'plato' : 'platos'}`
}

export function chefRecipeLabel(count: number): string {
  return count === 0 ? 'Sin recetas' : recipeCountLabel(count)
}
