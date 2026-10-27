import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { TooltipProvider } from '@/shared/components/ui/tooltip'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

interface ProvidersProps {
  /** Application subtree wrapped by the global providers. */
  children: ReactNode
}

/**
 * Global providers: server state (TanStack Query), session (Auth) and toasts.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors />
      </AuthProvider>
    </QueryClientProvider>
  )
}
