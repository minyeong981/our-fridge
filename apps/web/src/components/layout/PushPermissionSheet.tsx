'use client'

import { Bell } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

export function PushPermissionSheet() {
  const { isPushPermissionSheetOpen, allowPushPermission, dismissPushPermission } =
    useNotification()

  if (!isPushPermissionSheetOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[300]" onClick={dismissPushPermission} />
      <div className="fixed inset-0 z-[301] flex items-center justify-center px-8">
        <div className="w-full max-w-xs bg-white rounded-3xl px-6 py-8 flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
            <Bell size={26} className="text-primary" />
          </div>

          <div>
            <h2 className="font-bold text-base text-neutral-900">알림을 허용할까요?</h2>
            <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
              유통기한 임박, 공지사항, 새 댓글 등<br />중요한 소식을 놓치지 않을 수 있어요.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={allowPushPermission}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm"
            >
              허용하기
            </button>
            <button
              onClick={dismissPushPermission}
              className="w-full py-2.5 text-sm font-semibold text-neutral-400"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
