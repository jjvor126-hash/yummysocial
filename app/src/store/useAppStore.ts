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
import type { AppNotification, Comment, Recipe, User } from '../types'

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
              ? { ...recipe, savedByMe: !recipe.savedByMe }
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

          return {
            users: state.users.map((user) =>
              user.id === state.currentUserId
                ? {
                    ...user,
                    followingIds: user.followingIds.includes(userId)
                      ? user.followingIds.filter((id) => id !== userId)
                      : [...user.followingIds, userId],
                  }
                : user,
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

        return {
          ...currentState,
          ...persisted,
          users: currentState.users.map((user) => {
            const previous = persisted.users?.find((item) => item.id === user.id)
            return previous
              ? { ...user, followingIds: previous.followingIds ?? user.followingIds }
              : user
          }),
          recipes: currentState.recipes.map((recipe) => {
            const previous = persisted.recipes?.find((item) => item.id === recipe.id)
            return previous
              ? {
                  ...recipe,
                  likes: previous.likes ?? recipe.likes,
                  likedByMe: previous.likedByMe ?? recipe.likedByMe,
                  savedByMe: previous.savedByMe ?? recipe.savedByMe,
                }
              : recipe
          }),
          comments: persisted.comments ?? currentState.comments,
          notifications: persisted.notifications ?? currentState.notifications,
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
