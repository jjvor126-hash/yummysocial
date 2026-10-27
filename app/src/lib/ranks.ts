export type Rank = {
  name: string
  stars: number
}

/** Rangos de la comunidad, de menor a mayor. */
export const RANKS: Rank[] = [
  { name: 'Aprendiz', stars: 0 },
  { name: 'Cocinero', stars: 400 },
  { name: 'Chef', stars: 900 },
  { name: 'Maestro del Menú', stars: 1_800 },
  { name: 'Gurú Gastronómico', stars: 3_500 },
]

export type RankInfo = {
  index: number
  level: number
  current: Rank
  next: Rank | null
  progress: number
  remaining: number
}

export function getRank(stars: number): RankInfo {
  let index = 0
  RANKS.forEach((rank, position) => {
    if (stars >= rank.stars) index = position
  })

  const current = RANKS[index]
  const next = RANKS[index + 1] ?? null
  const progress = next
    ? Math.min(1, Math.max(0, (stars - current.stars) / (next.stars - current.stars)))
    : 1

  return {
    index,
    level: index + 1,
    current,
    next,
    progress,
    remaining: next ? Math.max(0, next.stars - stars) : 0,
  }
}
