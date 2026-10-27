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
  savedAt?: string
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

export type RecipeInput = {
  title: string
  description: string
  image: string
  timeMinutes: number
  difficulty: Difficulty
  servings: number
  calories: number
  tags: string[]
  ingredients: Array<Omit<Ingredient, 'id'>>
  steps: Array<Omit<RecipeStep, 'id'>>
}

export type ProfileInput = {
  name: string
  username: string
  bio: string
  location: string
  avatar: string
}

export type StoryAudience = 'todos' | 'amigos'

export type Story = {
  id: string
  authorId: string
  image: string
  caption: string
  tags: string[]
  overlayText: string
  textColor: string
  stickers: string[]
  location?: string
  durationHours: 12 | 24
  audience: StoryAudience
  createdAt: string
  expiresAt: string
}

export type StoryHighlight = {
  id: string
  userId: string
  label: string
  storyId: string
  image: string
}

export type StoryInput = {
  image: string
  caption: string
  tags: string[]
  overlayText: string
  textColor: string
  stickers: string[]
  location?: string
  durationHours: 12 | 24
  audience: StoryAudience
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
