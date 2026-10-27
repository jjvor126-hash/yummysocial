import type { Story, User } from '../types'

const HOUR_MS = 3_600_000

export type StoryGroup = {
  author: User
  stories: Story[]
  unseen: boolean
}

export function isStoryActive(story: Story, now = Date.now()) {
  return new Date(story.expiresAt).getTime() > now
}

export function isStoryVisible(story: Story, viewer: User | null) {
  if (story.audience === 'todos') return true
  if (!viewer) return false
  return story.authorId === viewer.id || viewer.followingIds.includes(story.authorId)
}

export function activeStories(
  stories: Story[],
  viewer: User | null,
  now = Date.now(),
): Story[] {
  return stories.filter(
    (story) => isStoryActive(story, now) && isStoryVisible(story, viewer),
  )
}

export function groupStoriesByAuthor(
  stories: Story[],
  users: User[],
  viewer: User | null,
  viewedStories: string[],
  now = Date.now(),
): StoryGroup[] {
  const active = activeStories(stories, viewer, now)
  const byAuthor = new Map<string, Story[]>()

  for (const story of active) {
    const list = byAuthor.get(story.authorId)
    if (list) list.push(story)
    else byAuthor.set(story.authorId, [story])
  }

  const groups: StoryGroup[] = []

  for (const [authorId, list] of byAuthor) {
    const author = users.find((user) => user.id === authorId)
    if (!author) continue

    const ordered = [...list].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )

    groups.push({
      author,
      stories: ordered,
      unseen: ordered.some((story) => !viewedStories.includes(story.id)),
    })
  }

  return groups.sort((a, b) => {
    const mineA = a.author.id === viewer?.id
    const mineB = b.author.id === viewer?.id
    if (mineA !== mineB) return mineA ? -1 : 1
    if (a.unseen !== b.unseen) return a.unseen ? -1 : 1

    const latestA = new Date(a.stories[a.stories.length - 1].createdAt).getTime()
    const latestB = new Date(b.stories[b.stories.length - 1].createdAt).getTime()
    return latestB - latestA
  })
}

export function storiesForAuthor(
  stories: Story[],
  authorId: string | undefined,
  viewer: User | null,
  now = Date.now(),
): Story[] {
  if (!authorId) return []
  return activeStories(stories, viewer, now)
    .filter((story) => story.authorId === authorId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function storyDurationMs(story: Story) {
  return story.overlayText.trim() ? 7_000 : 5_000
}

export function storyTimeLeft(story: Story, now = Date.now()) {
  const remaining = new Date(story.expiresAt).getTime() - now
  if (remaining <= 0) return 'Caducada'
  if (remaining < HOUR_MS) return 'Caduca en minutos'

  const hours = Math.round(remaining / HOUR_MS)
  return hours === 1 ? 'Queda 1 h' : `Quedan ${hours} h`
}
