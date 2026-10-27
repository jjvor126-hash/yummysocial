import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEMO_USER_ID,
  seedComments,
  seedNotifications,
  seedRecipes,
  seedUsers,
} from '../data/seed'
import { SECRET_STAR_COST } from '../lib/constants'
import type { AppNotification, Comment, ProfileInput, Recipe, RecipeInput, User } from '../types'

type AppState = {
  users: User[]
  recipes: Recipe[]
  comments: Comment[]
  notifications: AppNotification[]
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
      version: 1,
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<AppState>
        const seedRecipeIds = new Set(currentState.recipes.map((recipe) => recipe.id))
        const createdRecipes = (persisted.recipes ?? []).filter(
          (recipe) => !seedRecipeIds.has(recipe.id),
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
