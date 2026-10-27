import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

const items = [
  { to: '/feed', icon: 'home', label: 'Inicio' },
  { to: '/search', icon: 'search', label: 'Explorar' },
  { to: '/saved', icon: 'bookmark', label: 'Guardadas' },
  { to: '/profile', icon: 'person', label: 'Perfil' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-line bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-card-dark/95">
      <div className="flex items-center justify-around px-2 pt-2 pb-safe">
        {items.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <NavLink
          to="/create"
          aria-label="Crear receta"
          className="flex w-16 flex-col items-center gap-0.5 text-[10px] font-medium text-muted dark:text-gray-400"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95">
            <Icon name="add" className="text-[24px]" />
          </span>
          <span>Crear</span>
        </NavLink>

        {items.slice(2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-16 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
          isActive ? 'text-primary' : 'text-muted hover:text-primary dark:text-gray-400'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} className="text-[24px]" filled={isActive} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}
