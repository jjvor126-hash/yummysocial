import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

const TABS = [
  { to: '/leaderboard', label: 'Chefs', icon: 'emoji_events' },
  { to: '/top-dishes', label: 'Platos', icon: 'restaurant' },
]

export function RankingTabs() {
  return (
    <nav
      aria-label="Secciones de la clasificación"
      className="flex rounded-xl border border-line bg-white/70 p-1 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              isActive
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'text-muted hover:bg-black/5 hover:text-ink dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
            }`
          }
        >
          <Icon name={tab.icon} className="text-[18px]" />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
