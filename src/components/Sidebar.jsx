import { NavLink } from 'react-router-dom'
import { navSections } from '../layouts/navConfig'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
  const { hasRole } = useAuth()

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-border bg-surface px-4 py-6 shrink-0">
      <div className="px-2 mb-8">
        <p className="font-display text-lg text-ink leading-tight">Spice Export</p>
        <p className="text-xs text-ink-muted tracking-wide uppercase mt-0.5">Operations</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => !item.role || hasRole(item.role))
          if (visibleItems.length === 0) return null
          return (
            <div key={section.label}>
              <p className="px-2 text-[0.65rem] font-medium uppercase tracking-wider text-ink-muted mb-2">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-primary-tint text-primary font-medium'
                          : 'text-ink hover:bg-surface-muted'
                      }`
                    }
                  >
                    <item.icon size={17} strokeWidth={2} />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
