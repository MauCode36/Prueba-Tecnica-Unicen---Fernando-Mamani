import { LogOut } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { ROLE_LABELS } from '../utils/role-navigation.utils'

/**
 * Sidebar block with the signed-in user's data and the logout action.
 * Also validates the stored session against GET /auth/me.
 */
export function UserProfileCard() {
  const { user, logout } = useAuth()
  useCurrentUser()

  if (!user) return null

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
        <p className="truncate text-sm text-ink-muted">{user.email}</p>
        <span className="mt-1 w-fit rounded-full bg-navy-tint px-2 py-0.5 text-xs font-semibold text-ink">
          {ROLE_LABELS[user.role]}
        </span>
      </div>
      <Button type="button" variant="outline" onClick={logout} className="w-full justify-start">
        <LogOut aria-hidden="true" />
        Cerrar sesión
      </Button>
    </div>
  )
}
