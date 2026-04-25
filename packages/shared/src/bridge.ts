// RN 셸과 Next.js WebView 사이 메시지 브리지 타입.
// 양쪽 코드에서 이 타입을 import해 문자열 오타를 컴파일 오류로 잡는다.

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

/** 웹 → RN 방향 메시지 */
export type WebToRNMessage =
  | { type: 'logout' }
  | { type: 'auth_failed'; error: string }
  | { type: 'theme_change'; theme: 'light' | 'dark' | 'system' }
  | { type: 'open_url'; url: string }
  | { type: 'pick_image'; source: 'camera' | 'gallery' }
  | { type: 'notif_settings'; data: NotifSettings }
  | { type: 'request_push_permission' }

/** RN → 웹 방향 메시지 */
export type RNToWebMessage =
  | { type: 'push_notification'; notification: Notification }
  | { type: 'push_token'; token: string }
  | { type: 'image_picked'; base64: string }
  | { type: 'close_panel' }
  | { type: 'navigate'; url: string }
