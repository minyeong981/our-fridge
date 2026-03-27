'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { savePushToken } from '@our-fridge/api'
import { useNotificationStore } from '@/stores/useNotificationStore'

// Re-export types for backward compatibility
export type { NotifType, Notification, NotifSettings } from '@/stores/useNotificationStore'

const PUBLIC_PATHS = ['/login', '/auth']
const PUSH_PERMISSION_KEY = 'push_permission_asked'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { settings, addNotification, closePanel, showPushPermissionSheet } = useNotificationStore()

  // 첫 방문 시 푸시 권한 시트 표시
  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
    if (isPublic) return
    if (localStorage.getItem(PUSH_PERMISSION_KEY)) return
    showPushPermissionSheet()
  }, [pathname, showPushPermissionSheet])

  // RN에서 오는 메시지 수신
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      try {
        const msg = JSON.parse(typeof e.data === 'string' ? e.data : JSON.stringify(e.data))
        if (msg.type === 'navigate' && typeof msg.url === 'string') {
          router.push(msg.url)
        } else if (msg.type === 'close_panel') {
          closePanel()
        } else if (msg.type === 'push_notification' && msg.notification) {
          addNotification(msg.notification)
        } else if (msg.type === 'push_token' && typeof msg.token === 'string') {
          savePushToken(msg.token)
        }
      } catch {
        // 무시
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router, closePanel, addNotification])

  // 앱 시작 시 현재 설정을 RN으로 전송
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'notif_settings', data: settings }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

export function useNotification() {
  return useNotificationStore()
}
