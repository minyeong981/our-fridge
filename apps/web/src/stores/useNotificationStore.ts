import { create } from 'zustand'

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

const now = new Date()
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'expiry',
    title: '유통기한 임박',
    body: '유기농 갈라 사과가 내일 만료돼요.',
    createdAt: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
    isRead: false,
    link: '/fridges/1/items/i1',
  },
  {
    id: 'n2',
    type: 'comment',
    title: '새 댓글',
    body: 'Sarah J.님이 회원님의 게시글에 댓글을 남겼어요.',
    createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    isRead: false,
    link: '/community/p1',
  },
  {
    id: 'n3',
    type: 'notice',
    title: '냉장고 공지사항',
    body: '이번 주말 냉장고 청소 예정입니다.',
    createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    isRead: false,
    link: '/fridges/1',
    fridgeName: '거실 냉장고',
  },
  {
    id: 'n4',
    type: 'invite',
    title: '냉장고 초대',
    body: 'Marcus L.님이 사무실 냉장고에 초대했어요.',
    createdAt: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    link: '/invite/MOCK_CODE_2',
  },
]

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isPanelOpen: boolean
  isSettingsOpen: boolean
  isPushPermissionSheetOpen: boolean
  settings: NotifSettings

  // actions
  openPanel: () => void
  closePanel: () => void
  openSettings: () => void
  closeSettings: () => void
  markOneRead: (id: string) => void
  markAllRead: () => void
  deleteOne: (id: string) => void
  deleteAll: () => void
  updateSettings: (patch: Partial<NotifSettings>) => void
  addNotification: (n: Notification) => void
  allowPushPermission: () => void
  dismissPushPermission: () => void
  showPushPermissionSheet: () => void
}

function countUnread(notifications: Notification[]) {
  return notifications.filter((n) => !n.isRead).length
}

function setNotifications(notifications: Notification[]) {
  return { notifications, unreadCount: countUnread(notifications) }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: countUnread(INITIAL_NOTIFICATIONS),
  isPanelOpen: false,
  isSettingsOpen: false,
  isPushPermissionSheetOpen: false,
  settings: DEFAULT_SETTINGS,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false, isSettingsOpen: false }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  markOneRead: (id) =>
    set((state) => {
      const next = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      return setNotifications(next)
    }),
  markAllRead: () =>
    set((state) => setNotifications(state.notifications.map((n) => ({ ...n, isRead: true })))),
  deleteOne: (id) =>
    set((state) => setNotifications(state.notifications.filter((n) => n.id !== id))),
  deleteAll: () => set({ notifications: [], unreadCount: 0 }),

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch }
    set({ settings: next })
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'notif_settings', data: next }))
    }
  },

  addNotification: (n) =>
    set((state) => setNotifications([n, ...state.notifications])),

  allowPushPermission: () => {
    localStorage.setItem('push_permission_asked', 'granted')
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'request_push_permission' }))
    }
    set({ isPushPermissionSheetOpen: false })
  },
  dismissPushPermission: () => {
    localStorage.setItem('push_permission_asked', 'skipped')
    set({ isPushPermissionSheetOpen: false })
  },
  showPushPermissionSheet: () => set({ isPushPermissionSheetOpen: true }),
}))
