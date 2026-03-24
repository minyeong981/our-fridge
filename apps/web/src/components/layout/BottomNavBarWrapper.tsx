'use client'

import { usePathname, useRouter } from 'next/navigation'
import { BottomNavBar, NavTab } from './BottomNavBar'

function getActiveTab(pathname: string): NavTab {
  if (pathname === '/fridges' || pathname.startsWith('/fridges/')) return 'fridge'
  if (pathname.startsWith('/community')) return 'community'
  if (pathname.startsWith('/my'))        return 'my'
  return 'fridge'
}

export function BottomNavBarWrapper() {
  const pathname = usePathname()
  const router   = useRouter()

  const activeTab = getActiveTab(pathname)

  const handleTabChange = (tab: NavTab) => {
    switch (tab) {
      case 'fridge':    router.push('/fridges');    break
      case 'community': router.push('/community');  break
      case 'my':        router.push('/my');         break
    }
  }

  if (pathname.startsWith('/invite/')) return null
  if (pathname.startsWith('/login')) return null
  if (pathname.startsWith('/auth/')) return null

  return <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
}
