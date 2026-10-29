/** Estrellas mínimas que necesita el usuario para desbloquear contenido secreto. */
export const SECRET_STAR_COST = 50

/** Nivel de rango que se asigna por defecto a un secreto nuevo. */
export const DEFAULT_SECRET_LEVEL = 2

/** Número máximo de niveles de rango disponibles. */
export const MAX_SECRET_LEVEL = 5

export function clampSecretLevel(value: number | undefined): number {
  if (!Number.isFinite(value)) return DEFAULT_SECRET_LEVEL
  return Math.min(MAX_SECRET_LEVEL, Math.max(1, Math.round(value as number)))
}
