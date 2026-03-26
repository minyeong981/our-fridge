'use client'

import { initSupabase } from '@our-fridge/api'
import { createClient } from '@/lib/supabase/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'

// createBrowserClient(SSR)를 사용하는 웹 클라이언트를 넘겨야 세션 쿠키가 자동 관리됨
initSupabase(createClient())

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } }),
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}
