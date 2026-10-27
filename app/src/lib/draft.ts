import type { Difficulty } from '../types'

export type DraftIngredient = {
  id: string
  amount: string
  name: string
  secret: boolean
}

export type DraftStep = {
  id: string
  text: string
  secret: boolean
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
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
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
