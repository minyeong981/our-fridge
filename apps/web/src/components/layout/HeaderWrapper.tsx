'use client'

import { usePathname } from 'next/navigation'
import { FridgeListHeader } from '@/components/fridge-list/FridgeListHeader'
import { FridgeDetailHeader } from '@/components/fridges/FridgeDetailHeader'
import { BackHeader } from '@/components/layout/BackHeader'

const BACK_HEADER_TITLES: Record<string, string> = {
  add: '음식 추가',
  reports: '신고 내역',
}

export function HeaderWrapper() {
  const pathname = usePathname()

  if (pathname.startsWith('/invite/')) return null
  if (pathname.startsWith('/login')) return null
  if (pathname.startsWith('/auth/')) return null

  if (pathname === '/fridges') {
    return <FridgeListHeader />
  }

  if (pathname === '/community') {
    return <FridgeListHeader title="커뮤니티" />
  }

  if (pathname === '/my') {
    return <FridgeListHeader title="마이" />
  }

  if (/^\/fridges\/[^/]+$/.test(pathname)) {
    return <FridgeDetailHeader />
  }

  // items 상세 페이지는 자체 헤더 사용 (편집 버튼 등 페이지 내 액션 포함)
  if (pathname.includes('/items/')) {
    return null
  }

  if (pathname === '/community/write') {
    return null
  }

  if (pathname.startsWith('/community/')) {
    return <BackHeader title="게시글" />
  }

  if (pathname.startsWith('/fridges/')) {
    const segment = pathname.split('/').pop() ?? ''
    return <BackHeader title={BACK_HEADER_TITLES[segment] ?? ''} />
  }

  return null
}
