import { getRank } from './ranks'
import type { User } from '../types'

/** Estrellas que otorga cada acción dentro de la app. */
export const STAR_REWARDS = {
  recipe: 40,
  story: 10,
  comment: 5,
  likeReceived: 2,
  commentReceived: 3,
  followerReceived: 10,
} as const

export type StarRewardKey = keyof typeof STAR_REWARDS

export type StarReward = {
  key: StarRewardKey
  icon: string
  label: string
  stars: number
}

/** Lista lista para pintar en la guía de estrellas. */
export const STAR_REWARD_LIST: StarReward[] = [
  { key: 'recipe', icon: 'menu_book', label: 'Publicar una receta', stars: STAR_REWARDS.recipe },
  { key: 'story', icon: 'auto_stories', label: 'Publicar una historia', stars: STAR_REWARDS.story },
  { key: 'comment', icon: 'chat_bubble', label: 'Comentar una receta', stars: STAR_REWARDS.comment },
  {
    key: 'likeReceived',
    icon: 'favorite',
    label: 'Recibir un me gusta',
    stars: STAR_REWARDS.likeReceived,
  },
  {
    key: 'commentReceived',
    icon: 'forum',
    label: 'Recibir un comentario',
    stars: STAR_REWARDS.commentReceived,
  },
  {
    key: 'followerReceived',
    icon: 'person_add',
    label: 'Ganar un seguidor',
    stars: STAR_REWARDS.followerReceived,
  },
]

/** Suma (o resta) estrellas a un usuario y mantiene su rango al día. */
export function addStars(users: User[], userId: string, delta: number): User[] {
  if (!delta) return users

  return users.map((user) => {
    if (user.id !== userId) return user

    const stars = Math.max(0, user.stars + delta)
    return { ...user, stars, level: getRank(stars).current.name }
  })
}
