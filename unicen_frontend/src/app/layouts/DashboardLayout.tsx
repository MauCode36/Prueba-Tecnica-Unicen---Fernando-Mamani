import { NavLink, Outlet } from 'react-router'
import { UserProfileCard } from '@/features/auth/components/UserProfileCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { BrandMark } from '@/shared/components/BrandMark'
import { cn } from '@/shared/lib/utils'
import { NAV_ITEMS } from './nav-items'

/**
 * Authenticated shell: role-filtered sidebar with the brand, the
 * active-item dot, the user profile and the main content outlet.
 */
export function DashboardLayout() {
  const { user } = useAuth()
  const items = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role))

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface-200 p-4">
        <BrandMark className="px-3 pt-2 text-2xl text-ink" />
        <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-navy-tint hover:text-ink',
                  isActive && 'bg-navy-tint font-semibold text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cn('size-2 rounded-full', isActive ? 'bg-orange' : 'bg-transparent')}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <UserProfileCard />
      </aside>
      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
