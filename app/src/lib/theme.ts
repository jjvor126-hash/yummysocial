export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'yummysocial:theme'

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* localStorage may be unavailable */
  }
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function toggleTheme(): Theme {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
  setTheme(next)
  return next
}
