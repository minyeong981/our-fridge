'use client'

import { createContext, useContext, useState } from 'react'

export type NotifType = 'expiry' | 'notice' | 'comment' | 'invite' | 'item'

export interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  createdAt: string
  isRead: boolean
  link?: string
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isPanelOpen: boolean
  isSettingsOpen: boolean
  openPanel: () => void
  closePanel: () => void
  openSettings: () => void
  closeSettings: () => void
  markAllRead: () => void
  deleteOne: (id: string) => void
  deleteAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

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
    isRead: true,
    link: '/fridges/1',
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
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const openPanel = () => {
    setIsPanelOpen(true)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const closePanel = () => {
    setIsPanelOpen(false)
    setIsSettingsOpen(false)
  }

  const openSettings = () => setIsSettingsOpen(true)
  const closeSettings = () => setIsSettingsOpen(false)

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

  const deleteOne = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id))

  const deleteAll = () => setNotifications([])

  return (
    <NotificationContext.Provider
      value={{
        notifications, unreadCount,
        isPanelOpen, isSettingsOpen,
        openPanel, closePanel,
        openSettings, closeSettings,
        markAllRead, deleteOne, deleteAll,
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
