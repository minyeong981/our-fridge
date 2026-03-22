'use client'

import { usePathname, useRouter } from 'next/navigation'
import { BottomNavBar, NavTab } from './BottomNavBar'

function getActiveTab(pathname: string): NavTab {
  if (pathname === '/fridges' || pathname.startsWith('/fridges/')) return 'fridge'
  if (pathname.startsWith('/chat'))     return 'chat'
  if (pathname.startsWith('/calendar')) return 'calendar'
  if (pathname.startsWith('/my'))       return 'my'
  return 'fridge'
}

export function BottomNavBarWrapper() {
  const pathname = usePathname()
  const router   = useRouter()

  const activeTab = getActiveTab(pathname)

  const handleTabChange = (tab: NavTab) => {
    switch (tab) {
      case 'fridge':
        router.push('/fridges')
        break
      case 'chat':
        router.push('/chat')
        break
      case 'calendar':
        router.push('/calendar')
        break
      case 'my':
        router.push('/my')
        break
    }
  }

  return <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
}
