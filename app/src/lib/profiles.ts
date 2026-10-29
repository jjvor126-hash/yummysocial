import type { User } from '../types'

/** Ruta del perfil público de un usuario. */
export function profilePath(user: Pick<User, 'username'>): string {
  return `/u/${encodeURIComponent(user.username)}`
}

/** Busca un usuario por su nombre de usuario, sin distinguir mayúsculas ni acentos. */
export function findUserByUsername(users: User[], username?: string): User | undefined {
  if (!username) return undefined

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  const target = normalize(decodeURIComponent(username))
  return users.find((user) => normalize(user.username) === target)
}

/** Ruta de perfil propia o pública según el usuario en sesión. */
export function profilePathFor(
  user: Pick<User, 'id' | 'username'>,
  currentUserId?: string | null,
): string {
  return user.id === currentUserId ? '/profile' : profilePath(user)
}
