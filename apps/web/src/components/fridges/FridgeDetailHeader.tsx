'use client'

import { Menu } from 'lucide-react'
import { useFridgeDetail } from '@/contexts/FridgeDetailContext'
import { NotificationBell } from '@/components/layout/NotificationBell'

export function FridgeDetailHeader() {
  const { fridgeName, fridgeLocation, setIsSidePanelOpen } = useFridgeDetail()

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
      <div className="flex flex-col min-w-0">
        <h1 className="font-bold text-lg text-neutral-800 truncate">{fridgeName}</h1>
        {fridgeLocation && <p className="text-xs text-neutral-400">{fridgeLocation}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <div onClick={() => setIsSidePanelOpen(false)}>
          <NotificationBell />
        </div>
        <button
          aria-label="메뉴"
          onClick={() => setIsSidePanelOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center"
        >
          <Menu size={20} className="text-neutral-500" />
        </button>
      </div>
    </header>
  )
}
