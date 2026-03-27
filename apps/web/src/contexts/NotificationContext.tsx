'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const PUSH_PERMISSION_KEY = 'push_permission_asked'
const PUBLIC_PATHS = ['/login', '/auth']

export type NotifType = 'expiry' | 'notice' | 'comment' | 'invite' | 'item'

export interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  createdAt: string
  isRead: boolean
  link?: string
  fridgeName?: string
}

export interface NotifSettings {
  master: boolean
  fridgeExpiry: boolean
  fridgeNotice: boolean
  fridgeInvite: boolean
  communityMyPostComment: boolean
  communityMyComment: boolean
  communityLikedPost: boolean
  communityShare: boolean
  communityReport: boolean
}

const DEFAULT_SETTINGS: NotifSettings = {
  master: true,
  fridgeExpiry: true,
  fridgeNotice: true,
  fridgeInvite: true,
  communityMyPostComment: true,
  communityMyComment: true,
  communityLikedPost: false,
  communityShare: true,
  communityReport: true,
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isPanelOpen: boolean
  isSettingsOpen: boolean
  isPushPermissionSheetOpen: boolean
  settings: NotifSettings
  openPanel: () => void
  closePanel: () => void
  openSettings: () => void
  closeSettings: () => void
  markOneRead: (id: string) => void
  markAllRead: () => void
  deleteOne: (id: string) => void
  deleteAll: () => void
  updateSettings: (patch: Partial<NotifSettings>) => void
  allowPushPermission: () => void
  dismissPushPermission: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

function postToRN(data: object) {
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    ;(window as any).ReactNativeWebView.postMessage(JSON.stringify(data))
  }
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'expiry',
    title: '유통기한 임박',
    body: '유기농 갈라 사과가 내일 만료돼요.',
    createdAt: '방금 전',
    isRead: false,
    link: '/fridges/1/items/i1',
  },
  {
    id: 'n2',
    type: 'comment',
    title: '새 댓글',
    body: 'Sarah J.님이 회원님의 게시글에 댓글을 남겼어요.',
    createdAt: '10분 전',
    isRead: false,
    link: '/community/p1',
  },
  {
    id: 'n3',
    type: 'notice',
    title: '냉장고 공지사항',
    body: '이번 주말 냉장고 청소 예정입니다.',
    createdAt: '1시간 전',
    isRead: false,
    link: '/fridges/1',
    fridgeName: '거실 냉장고',
  },
  {
    id: 'n4',
    type: 'invite',
    title: '냉장고 초대',
    body: 'Marcus L.님이 사무실 냉장고에 초대했어요.',
    createdAt: '어제',
    isRead: true,
    link: '/invite/MOCK_CODE_2',
  },
]

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPushPermissionSheetOpen, setIsPushPermissionSheetOpen] = useState(false)
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const openPanel = () => setIsPanelOpen(true)

  const closePanel = () => {
    setIsPanelOpen(false)
    setIsSettingsOpen(false)
  }

  const openSettings = () => setIsSettingsOpen(true)
  const closeSettings = () => setIsSettingsOpen(false)

  const markOneRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

  const deleteOne = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id))

  const deleteAll = () => setNotifications([])

  const updateSettings = useCallback((patch: Partial<NotifSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      postToRN({ type: 'notif_settings', data: next })
      return next
    })
  }, [])

  const allowPushPermission = () => {
    localStorage.setItem(PUSH_PERMISSION_KEY, 'granted')
    postToRN({ type: 'request_push_permission' })
    setIsPushPermissionSheetOpen(false)
  }

  const dismissPushPermission = () => {
    localStorage.setItem(PUSH_PERMISSION_KEY, 'skipped')
    setIsPushPermissionSheetOpen(false)
  }

  // 첫 방문 시 푸시 권한 시트 표시
  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
    if (isPublic) return
    if (localStorage.getItem(PUSH_PERMISSION_KEY)) return
    setIsPushPermissionSheetOpen(true)
  }, [pathname])

  // RN에서 오는 메시지 수신 (navigate 등)
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      try {
        const msg = JSON.parse(typeof e.data === 'string' ? e.data : JSON.stringify(e.data))
        if (msg.type === 'navigate' && typeof msg.url === 'string') {
          router.push(msg.url)
        } else if (msg.type === 'close_panel') {
          setIsPanelOpen(false)
          setIsSettingsOpen(false)
        } else if (msg.type === 'push_notification' && msg.notification) {
          setNotifications((prev) => [msg.notification, ...prev])
        }
        // push_token은 백엔드 연동 시 여기서 처리
      } catch {
        // 무시
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router])

  // 앱 시작 시 현재 설정을 RN으로 전송
  useEffect(() => {
    postToRN({ type: 'notif_settings', data: settings })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isPanelOpen,
        isSettingsOpen,
        isPushPermissionSheetOpen,
        settings,
        openPanel,
        closePanel,
        openSettings,
        closeSettings,
        markOneRead,
        markAllRead,
        deleteOne,
        deleteAll,
        updateSettings,
        allowPushPermission,
        dismissPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}
