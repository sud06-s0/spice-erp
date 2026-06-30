import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/useAuth'

export default function DashboardLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3.5">
          <div>
            <p className="text-sm text-ink-muted">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-ink leading-tight">{profile?.full_name ?? 'Loading…'}</p>
              <p className="text-xs text-ink-muted leading-tight">{profile?.designation ?? profile?.department}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
