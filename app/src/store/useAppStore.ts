import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEMO_USER_ID,
  seedComments,
  seedHighlights,
  seedNotifications,
  seedRecipes,
  seedStories,
  seedUsers,
} from '../data/seed'
import { SECRET_STAR_COST } from '../lib/constants'
import { isStoryActive } from '../lib/stories'
import type {
  AppNotification,
  Comment,
  ProfileInput,
  Recipe,
  RecipeInput,
  Story,
  StoryHighlight,
  StoryInput,
  User,
} from '../types'

type AppState = {
  users: User[]
  recipes: Recipe[]
  comments: Comment[]
  notifications: AppNotification[]
  stories: Story[]
  highlights: StoryHighlight[]
  viewedStories: string[]
  hiddenStories: string[]
  hiddenHighlights: string[]
  unlockedSecrets: string[]
  currentUserId: string | null
  hasOnboarded: boolean
  login: () => void
  logout: () => void
  completeOnboarding: () => void
  toggleLike: (recipeId: string) => void
  toggleSave: (recipeId: string) => void
  addComment: (recipeId: string, text: string) => void
  addRecipe: (input: RecipeInput) => string
  updateProfile: (input: ProfileInput) => void
  toggleFollow: (userId: string) => void
  addStory: (input: StoryInput) => string
  deleteStory: (storyId: string) => void
  markStoryViewed: (storyId: string) => void
  addHighlight: (storyId: string, label: string) => void
  removeHighlight: (highlightId: string) => void
  unlockSecrets: (recipeId: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  resetDemoData: () => void
}

const initialState = {
  users: seedUsers,
  recipes: seedRecipes,
  comments: seedComments,
  notifications: seedNotifications,
  stories: seedStories,
  highlights: seedHighlights,
  viewedStories: [] as string[],
  hiddenStories: [] as string[],
  hiddenHighlights: [] as string[],
  unlockedSecrets: [] as string[],
  currentUserId: null as string | null,
  hasOnboarded: false,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      login: () => set({ currentUserId: DEMO_USER_ID }),
      logout: () => set({ currentUserId: null }),
      completeOnboarding: () => set({ hasOnboarded: true }),

      toggleLike: (recipeId) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === recipeId
              ? {
                  ...recipe,
                  likedByMe: !recipe.likedByMe,
                  likes: recipe.likes + (recipe.likedByMe ? -1 : 1),
                }
              : recipe,
          ),
        })),

      toggleSave: (recipeId) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === recipeId
              ? {
                  ...recipe,
                  savedByMe: !recipe.savedByMe,
                  savedAt: recipe.savedByMe ? undefined : new Date().toISOString(),
                }
              : recipe,
          ),
        })),

      addComment: (recipeId, text) => {
        const trimmed = text.trim()
        if (!trimmed) return

        set((state) => {
          if (!state.currentUserId) return state

          const comment: Comment = {
            id: `c-${Date.now()}`,
            recipeId,
            userId: state.currentUserId,
            text: trimmed,
            createdAt: new Date().toISOString(),
            likes: 0,
            likedByMe: false,
          }

          return {
            comments: [comment, ...state.comments],
            recipes: state.recipes.map((recipe) =>
              recipe.id === recipeId
                ? { ...recipe, commentCount: recipe.commentCount + 1 }
                : recipe,
            ),
          }
        })
      },

      toggleFollow: (userId) =>
        set((state) => {
          if (!state.currentUserId) return state

          const current = state.users.find((user) => user.id === state.currentUserId)
          if (!current) return state

          const wasFollowing = current.followingIds.includes(userId)

          return {
            users: state.users.map((user) => {
              if (user.id === state.currentUserId) {
                return {
                  ...user,
                  followingIds: wasFollowing
                    ? user.followingIds.filter((id) => id !== userId)
                    : [...user.followingIds, userId],
                  following: Math.max(0, user.following + (wasFollowing ? -1 : 1)),
                }
              }

              if (user.id === userId) {
                return {
                  ...user,
                  followers: Math.max(0, user.followers + (wasFollowing ? -1 : 1)),
                }
              }

              return user
            }),
          }
        }),

      addRecipe: (input) => {
        const id = `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

        set((state) => {
          if (!state.currentUserId) return state

          const recipe: Recipe = {
            ...input,
            id,
            authorId: state.currentUserId,
            ingredients: input.ingredients.map((ingredient, index) => ({
              ...ingredient,
              id: `${id}-i${index + 1}`,
            })),
            steps: input.steps.map((step, index) => ({
              ...step,
              id: `${id}-s${index + 1}`,
            })),
            likes: 0,
            commentCount: 0,
            likedByMe: false,
            savedByMe: false,
            rating: 0,
            ratingCount: 0,
            createdAt: new Date().toISOString(),
          }

          return { recipes: [recipe, ...state.recipes] }
        })

        return id
      },

      updateProfile: (input) =>
        set((state) => {
          if (!state.currentUserId) return state

          return {
            users: state.users.map((user) =>
              user.id === state.currentUserId ? { ...user, ...input } : user,
            ),
          }
        }),

      addStory: (input) => {
        const id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const now = Date.now()

        set((state) => {
          if (!state.currentUserId) return state

          const story: Story = {
            ...input,
            id,
            authorId: state.currentUserId,
            location: input.location?.trim() || undefined,
            createdAt: new Date(now).toISOString(),
            expiresAt: new Date(now + input.durationHours * 3_600_000).toISOString(),
          }

          return { stories: [story, ...state.stories] }
        })

        return id
      },

      deleteStory: (storyId) =>
        set((state) => {
          const target = state.stories.find(
            (story) =>
              story.id === storyId && story.authorId === state.currentUserId,
          )
          if (!target) return state

          const removedHighlights = state.highlights.filter(
            (highlight) =>
              highlight.storyId === storyId &&
              highlight.userId === state.currentUserId,
          )

          return {
            stories: state.stories.filter((story) => story.id !== storyId),
            highlights: state.highlights.filter(
              (highlight) =>
                !removedHighlights.some((item) => item.id === highlight.id),
            ),
            viewedStories: state.viewedStories.filter((id) => id !== storyId),
            hiddenStories: [...new Set([...state.hiddenStories, storyId])],
            hiddenHighlights: [
              ...new Set([
                ...state.hiddenHighlights,
                ...removedHighlights.map((highlight) => highlight.id),
              ]),
            ],
          }
        }),

      markStoryViewed: (storyId) =>
        set((state) =>
          state.viewedStories.includes(storyId)
            ? state
            : { viewedStories: [...state.viewedStories, storyId] },
        ),

      addHighlight: (storyId, label) =>
        set((state) => {
          if (!state.currentUserId) return state

          const story = state.stories.find(
            (item) => item.id === storyId && item.authorId === state.currentUserId,
          )
          const cleanLabel = label.trim().slice(0, 18)
          if (!story || !cleanLabel) return state

          const existing = state.highlights.find(
            (highlight) =>
              highlight.storyId === storyId &&
              highlight.userId === state.currentUserId,
          )
          const highlight: StoryHighlight = {
            id: existing?.id ?? `h-${Date.now()}`,
            userId: state.currentUserId,
            label: cleanLabel,
            storyId,
            image: story.image,
          }

          return {
            highlights: existing
              ? state.highlights.map((item) =>
                  item.id === existing.id ? highlight : item,
                )
              : [...state.highlights, highlight],
          }
        }),

      removeHighlight: (highlightId) =>
        set((state) => ({
          highlights: state.highlights.filter(
            (highlight) =>
              !(
                highlight.id === highlightId &&
                highlight.userId === state.currentUserId
              ),
          ),
          hiddenHighlights: [...new Set([...state.hiddenHighlights, highlightId])],
        })),

      unlockSecrets: (recipeId) =>
        set((state) => {
          if (!state.currentUserId) return state
          if (state.unlockedSecrets.includes(recipeId)) return state

          const user = state.users.find((item) => item.id === state.currentUserId)
          if (!user || user.stars < SECRET_STAR_COST) return state

          return { unlockedSecrets: [...state.unlockedSecrets, recipeId] }
        }),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),

      resetDemoData: () => set({ ...initialState }),
    }),
    {
      name: 'yummysocial:store',
      version: 2,
      migrate: (persistedState) => {
        const persisted = (persistedState ?? {}) as Partial<AppState>
        return {
          stories: [],
          highlights: [],
          viewedStories: [],
          hiddenStories: [],
          hiddenHighlights: [],
          ...persisted,
        } as AppState
      },
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<AppState>
        const seedRecipeIds = new Set(currentState.recipes.map((recipe) => recipe.id))
        const createdRecipes = (persisted.recipes ?? []).filter(
          (recipe) => !seedRecipeIds.has(recipe.id),
        )
        const seedStoryIds = new Set(currentState.stories.map((story) => story.id))
        const hiddenStories = new Set(persisted.hiddenStories ?? [])
        const seedStories = currentState.stories.filter(
          (story) => !hiddenStories.has(story.id),
        )
        const createdStories = (persisted.stories ?? []).filter(
          (story) =>
            !seedStoryIds.has(story.id) &&
            !hiddenStories.has(story.id) &&
            isStoryActive(story),
        )
        const storyIds = new Set([
          ...seedStories.map((story) => story.id),
          ...createdStories.map((story) => story.id),
        ])
        const hiddenHighlights = new Set(persisted.hiddenHighlights ?? [])
        const seedHighlightIds = new Set(
          currentState.highlights.map((highlight) => highlight.id),
        )
        const seedHighlights = currentState.highlights.filter(
          (highlight) =>
            !hiddenHighlights.has(highlight.id) && storyIds.has(highlight.storyId),
        )
        const createdHighlights = (persisted.highlights ?? []).filter(
          (highlight) =>
            !seedHighlightIds.has(highlight.id) &&
            !hiddenHighlights.has(highlight.id) &&
            storyIds.has(highlight.storyId),
        )

        return {
          ...currentState,
          ...persisted,
          users: currentState.users.map((user) => {
            const previous = persisted.users?.find((item) => item.id === user.id)
            if (!previous) return user

            return {
              ...user,
              name: previous.name ?? user.name,
              username: previous.username ?? user.username,
              avatar: previous.avatar ?? user.avatar,
              bio: previous.bio ?? user.bio,
              location: previous.location ?? user.location,
              followingIds: previous.followingIds ?? user.followingIds,
              followers: previous.followers ?? user.followers,
              following: previous.following ?? user.following,
            }
          }),
          recipes: [
            ...currentState.recipes.map((recipe) => {
              const previous = persisted.recipes?.find((item) => item.id === recipe.id)
              return previous
                ? {
                    ...recipe,
                    likes: previous.likes ?? recipe.likes,
                    likedByMe: previous.likedByMe ?? recipe.likedByMe,
                    savedByMe: previous.savedByMe ?? recipe.savedByMe,
                    savedAt: previous.savedAt ?? recipe.savedAt,
                  }
                : recipe
            }),
            ...createdRecipes,
          ],
          comments: persisted.comments ?? currentState.comments,
          stories: [...seedStories, ...createdStories],
          highlights: [...seedHighlights, ...createdHighlights],
          viewedStories: (persisted.viewedStories ?? []).filter((id) =>
            storyIds.has(id),
          ),
          hiddenStories: [...hiddenStories],
          hiddenHighlights: [...hiddenHighlights],
          notifications: currentState.notifications.map((notification) => {
            const previous = persisted.notifications?.find(
              (item) => item.id === notification.id,
            )
            return previous ? { ...notification, read: previous.read } : notification
          }),
          unlockedSecrets: persisted.unlockedSecrets ?? currentState.unlockedSecrets,
        }
      },
    },
  ),
)

export function useCurrentUser() {
  return useAppStore(
    (state) => state.users.find((user) => user.id === state.currentUserId) ?? null,
  )
}

export function useUnreadNotifications() {
  return useAppStore(
    (state) => state.notifications.filter((notification) => !notification.read).length,
  )
}
