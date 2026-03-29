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


export interface NotificationState {
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
  notifications: [],
  unreadCount: 0,
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
      ;(window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'notif_settings', data: next }),
      )
    }
  },

  addNotification: (n) => set((state) => setNotifications([n, ...state.notifications])),

  allowPushPermission: () => {
    localStorage.setItem('push_permission_asked', 'granted')
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      ;(window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'request_push_permission' }),
      )
    }
    set({ isPushPermissionSheetOpen: false })
  },
  dismissPushPermission: () => {
    localStorage.setItem('push_permission_asked', 'skipped')
    set({ isPushPermissionSheetOpen: false })
  },
  showPushPermissionSheet: () => set({ isPushPermissionSheetOpen: true }),
}))
