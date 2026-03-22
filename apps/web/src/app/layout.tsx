import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { BottomNavBarWrapper } from '@/components/layout/BottomNavBarWrapper'
import { HeaderWrapper } from '@/components/layout/HeaderWrapper'
import { FridgeDetailProvider } from '@/contexts/FridgeDetailContext'

export const metadata: Metadata = {
  title: '우리의 냉장고',
  description: '공용 냉장고 관리 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="h-dvh overflow-hidden flex flex-col">
        <FridgeDetailProvider>
          <HeaderWrapper />
          <Providers>
            <div className="flex-1 min-h-0 overflow-hidden">
              {children}
            </div>
          </Providers>
        </FridgeDetailProvider>
        <BottomNavBarWrapper />
      </body>
    </html>
  )
}
