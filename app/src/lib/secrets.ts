import { DEFAULT_SECRET_LEVEL, MAX_SECRET_LEVEL } from './constants'
import { RANKS, getRank } from './ranks'
import type { Ingredient, Recipe, RecipeStep } from '../types'

export type SecretItem = Pick<Ingredient, 'secret' | 'unlockLevel' | 'premiumOnly'>

export type SecretAccessReason = 'author' | 'subscription' | 'level' | 'shortcut'

export type SecretAccess = {
  isSecret: boolean
  unlocked: boolean
  premiumOnly: boolean
  requiredLevel: number
  requiredRank: string
  isAuthor: boolean
  unlockedByLevel: boolean
  unlockedBySubscription: boolean
  unlockedByShortcut: boolean
  reasons: SecretAccessReason[]
}

export function isSecretItem(item: SecretItem): boolean {
  return item.secret === true || item.premiumOnly === true
}

/** Nivel necesario para abrir el secreto; los secretos antiguos caen en el nivel 2. */
export function secretLevel(item: SecretItem): number {
  const level = item.unlockLevel ?? DEFAULT_SECRET_LEVEL
  if (!Number.isFinite(level)) return DEFAULT_SECRET_LEVEL
  return Math.min(MAX_SECRET_LEVEL, Math.max(1, Math.round(level)))
}

export function secretRankName(level: number): string {
  return RANKS[Math.min(RANKS.length, Math.max(1, level)) - 1]?.name ?? RANKS[0].name
}

export function getSecretAccess({
  item,
  stars,
  subscriptionActive,
  recipeShortcut,
  isAuthor,
}: {
  item: SecretItem
  stars: number
  subscriptionActive: boolean
  /** El usuario ya desbloqueó todos los secretos de esta receta con 50 estrellas. */
  recipeShortcut: boolean
  isAuthor: boolean
}): SecretAccess {
  const isSecret = isSecretItem(item)
  const requiredLevel = secretLevel(item)
  const premiumOnly = item.premiumOnly === true
  const unlockedByLevel = !premiumOnly && isSecret && getRank(stars).level >= requiredLevel
  const unlockedBySubscription = isSecret && subscriptionActive
  const unlockedByShortcut = isSecret && !premiumOnly && recipeShortcut
  const unlocked =
    !isSecret || isAuthor || unlockedBySubscription || unlockedByLevel || unlockedByShortcut

  const reasons: SecretAccessReason[] = []
  if (isSecret && isAuthor) reasons.push('author')
  if (unlockedBySubscription) reasons.push('subscription')
  if (unlockedByLevel) reasons.push('level')
  if (unlockedByShortcut) reasons.push('shortcut')

  return {
    isSecret,
    unlocked,
    premiumOnly,
    requiredLevel,
    requiredRank: secretRankName(requiredLevel),
    isAuthor,
    unlockedByLevel,
    unlockedBySubscription,
    unlockedByShortcut,
    reasons,
  }
}

export function countRecipeSecrets(recipe: Pick<Recipe, 'ingredients' | 'steps'>): {
  total: number
  premium: number
} {
  const items: Array<Ingredient | RecipeStep> = [...recipe.ingredients, ...recipe.steps]
  const secrets = items.filter(isSecretItem)
  return {
    total: secrets.length,
    premium: secrets.filter((item) => item.premiumOnly === true).length,
  }
}
