'use client'

import {
  Bell,
  Package,
  Megaphone,
  MessageCircle,
  Refrigerator,
  ChevronLeft,
  X,
  Settings2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotification, type NotifType } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'

const TYPE_ICON: Record<NotifType, React.ReactNode> = {
  expiry: <Package size={15} className="text-amber-500" />,
  notice: <Megaphone size={15} className="text-primary" />,
  comment: <MessageCircle size={15} className="text-green-500" />,
  invite: <Refrigerator size={15} className="text-neutral-500" />,
  item: <Package size={15} className="text-secondary" />,
}

export function NotificationPanel() {
  const router = useRouter()
  const { notifications, isPanelOpen, closePanel, openSettings, deleteOne, deleteAll } =
    useNotification()

  if (!isPanelOpen) return null

  const handleItemClick = (link?: string) => {
    if (!link) return
    closePanel()
    router.push(link)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[200]" onClick={closePanel} />

      <div className="fixed inset-0 bg-white z-[201] flex flex-col">
        {/* 헤더 */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
          <button
            onClick={closePanel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeft size={22} className="text-neutral-700" />
          </button>
          <h1 className="font-bold text-base text-neutral-800">알림</h1>
          <button
            onClick={openSettings}
            aria-label="알림 설정"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <Settings2 size={18} className="text-neutral-400" />
          </button>
        </div>

        {/* 알림 목록 */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 pb-16">
              <Bell size={32} className="text-neutral-200" />
              <p className="text-sm text-neutral-400">알림이 없습니다</p>
            </div>
          ) : (
            <>
              <ul className="divide-y">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-5 py-4 transition-colors',
                      !n.isRead && 'bg-orange-50',
                      n.link && 'cursor-pointer active:bg-neutral-50',
                    )}
                    onClick={() => handleItemClick(n.link)}
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                      {TYPE_ICON[n.type]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-800">{n.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[11px] text-neutral-400 mt-1">{n.createdAt}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteOne(n.id)
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors shrink-0 mt-0.5"
                    >
                      <X size={13} className="text-neutral-400" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={deleteAll}
                className="w-full py-4 text-xs text-neutral-400 font-medium hover:text-red-400 transition-colors"
              >
                전체 삭제
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
