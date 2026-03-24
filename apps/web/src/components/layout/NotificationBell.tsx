'use client'

import { Bell } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

export function NotificationBell() {
  const { unreadCount, openPanel } = useNotification()

  return (
    <button
      onClick={openPanel}
      aria-label="알림"
      className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
    >
      <Bell size={20} strokeWidth={2.2} className="text-neutral-500" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary" />
      )}
    </button>
  )
}
