'use client'

import { usePathname } from 'next/navigation'
import { FridgeListHeader } from '@/components/fridge-list/FridgeListHeader'
import { FridgeDetailHeader } from '@/components/fridges/FridgeDetailHeader'
import { BackHeader } from '@/components/layout/BackHeader'

const BACK_HEADER_TITLES: Record<string, string> = {
  add: '식재료 추가',
}

export function HeaderWrapper() {
  const pathname = usePathname()

  if (pathname === '/fridges') {
    return <FridgeListHeader />
  }

  if (/^\/fridges\/[^/]+$/.test(pathname)) {
    return <FridgeDetailHeader />
  }

  if (pathname.startsWith('/fridges/')) {
    const segment = pathname.split('/').pop() ?? ''
    return <BackHeader title={BACK_HEADER_TITLES[segment] ?? ''} />
  }

  return null
}
