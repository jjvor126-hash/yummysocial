import type { StoryAudience } from '../types'

export type StoryDraft = {
  image: string
  overlayText: string
  textColor: string
  stickers: string[]
  caption: string
  tags: string
  durationHours: 12 | 24
  audience: StoryAudience
  location: string
}

const STORY_DRAFT_KEY = 'yummysocial:story-draft'

export const emptyStoryDraft: StoryDraft = {
  image: '',
  overlayText: '',
  textColor: '#ffffff',
  stickers: [],
  caption: '',
  tags: '',
  durationHours: 24,
  audience: 'todos',
  location: '',
}

export function loadStoryDraft(): StoryDraft | null {
  try {
    const raw = localStorage.getItem(STORY_DRAFT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<StoryDraft>
    if (typeof parsed.image !== 'string' || !parsed.image) return null

    return {
      ...emptyStoryDraft,
      image: parsed.image,
      overlayText: parsed.overlayText ?? '',
      textColor: parsed.textColor ?? emptyStoryDraft.textColor,
      stickers: Array.isArray(parsed.stickers) ? parsed.stickers.slice(0, 6) : [],
      caption: parsed.caption ?? '',
      tags: parsed.tags ?? '',
      durationHours: parsed.durationHours === 12 ? 12 : 24,
      audience: parsed.audience === 'amigos' ? 'amigos' : 'todos',
      location: parsed.location ?? '',
    }
  } catch {
    return null
  }
}

export function saveStoryDraft(draft: StoryDraft): boolean {
  try {
    localStorage.setItem(STORY_DRAFT_KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function clearStoryDraft(): void {
  try {
    localStorage.removeItem(STORY_DRAFT_KEY)
  } catch {
    /* localStorage may be unavailable */
  }
}
