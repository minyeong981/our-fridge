'use client'

import { initSupabase } from '@our-fridge/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

initSupabase(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
