import { DEFAULT_SECRET_LEVEL, clampSecretLevel } from './constants'
import type { Difficulty } from '../types'

export type DraftIngredient = {
  id: string
  amount: string
  name: string
  secret: boolean
  unlockLevel: number
  premiumOnly: boolean
}

export type DraftStep = {
  id: string
  text: string
  secret: boolean
  unlockLevel: number
  premiumOnly: boolean
}

export type RecipeDraft = {
  title: string
  description: string
  image: string
  timeMinutes: string
  difficulty: Difficulty
  servings: string
  calories: string
  tags: string
  ingredients: DraftIngredient[]
  steps: DraftStep[]
}

const DRAFT_KEY = 'yummysocial:recipe-draft'

type LegacyDraftItem = {
  secret?: boolean
  unlockLevel?: number
  premiumOnly?: boolean
}

function normalizeLock<T extends LegacyDraftItem>(item: T): T {
  const secret = item.secret === true || item.premiumOnly === true
  return {
    ...item,
    secret,
    unlockLevel: clampSecretLevel(item.unlockLevel ?? DEFAULT_SECRET_LEVEL),
    premiumOnly: item.premiumOnly === true,
  }
}

export function loadDraft(): RecipeDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<RecipeDraft>
    if (typeof parsed.title !== 'string') return null

    return {
      title: parsed.title,
      description: parsed.description ?? '',
      image: parsed.image ?? '',
      timeMinutes: parsed.timeMinutes ?? '30',
      difficulty: parsed.difficulty ?? 'Fácil',
      servings: parsed.servings ?? '2',
      calories: parsed.calories ?? '',
      tags: parsed.tags ?? '',
      ingredients: Array.isArray(parsed.ingredients)
        ? parsed.ingredients.map((item) => normalizeLock(item as DraftIngredient))
        : [],
      steps: Array.isArray(parsed.steps)
        ? parsed.steps.map((item) => normalizeLock(item as DraftStep))
        : [],
    }
  } catch {
    return null
  }
}

export function saveDraft(draft: RecipeDraft): boolean {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* localStorage may be unavailable */
  }
}
