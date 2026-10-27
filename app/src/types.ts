export type Difficulty = 'Fácil' | 'Media' | 'Difícil'

export type Ingredient = {
  id: string
  name: string
  amount: string
  secret?: boolean
}

export type RecipeStep = {
  id: string
  text: string
  secret?: boolean
}

export type Recipe = {
  id: string
  authorId: string
  title: string
  description: string
  image: string
  timeMinutes: number
  difficulty: Difficulty
  servings: number
  calories: number
  rating: number
  ratingCount: number
  tags: string[]
  ingredients: Ingredient[]
  steps: RecipeStep[]
  likes: number
  commentCount: number
  likedByMe: boolean
  savedByMe: boolean
  createdAt: string
}

export type User = {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  location: string
  followers: number
  following: number
  stars: number
  level: string
  followingIds: string[]
}

export type Comment = {
  id: string
  recipeId: string
  userId: string
  text: string
  createdAt: string
  likes: number
  likedByMe: boolean
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'system'

export type AppNotification = {
  id: string
  type: NotificationType
  userId?: string
  recipeId?: string
  message?: string
  createdAt: string
  read: boolean
}
