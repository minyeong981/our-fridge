'use client'

import { Bell, Menu } from 'lucide-react'
import { useFridgeDetail } from '@/contexts/FridgeDetailContext'

export function FridgeDetailHeader() {
  const { fridgeName, fridgeLocation, setIsSidePanelOpen } = useFridgeDetail()

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
      <div className="flex flex-col min-w-0">
        <h1 className="font-bold text-lg text-neutral-800 truncate">{fridgeName}</h1>
        {fridgeLocation && <p className="text-xs text-neutral-400">{fridgeLocation}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          aria-label="알림"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <Bell size={20} className="text-neutral-500" />
        </button>
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
