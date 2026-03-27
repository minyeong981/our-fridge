import { useEffect, useRef } from 'react'
import type React from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import type { WebView } from 'react-native-webview'

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

// 전역 설정 참조 — setNotificationHandler는 모듈 레벨에서 한 번만 등록되므로
// 최신 설정을 읽으려면 ref가 아닌 가변 변수를 사용한다
let _settings: NotifSettings = {
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

export function updateNotifHandlerSettings(settings: NotifSettings) {
  _settings = { ..._settings, ...settings }
}

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    if (!_settings.master) {
      return { shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }
    }
    const category = notification.request.content.data?.category as string | undefined
    const allowed = isAllowed(category, _settings)
    return {
      shouldShowBanner: allowed,
      shouldShowList: allowed,
      shouldPlaySound: allowed,
      shouldSetBadge: allowed,
    }
  },
})

function isAllowed(category: string | undefined, s: NotifSettings): boolean {
  switch (category) {
    case 'expiry':   return s.fridgeExpiry
    case 'notice':   return s.fridgeNotice
    case 'invite':   return s.fridgeInvite
    case 'comment':  return s.communityMyPostComment
    default:         return true
  }
}

// Android 알림 채널 설정 — 에뮬레이터 포함, 실기기 여부 무관하게 실행
async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync('default', {
    name: '기본 알림',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4AB8CF',
  })
}

// 앱 시작 시 채널 초기화 (fire & forget)
setupAndroidChannel()

async function getPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null

  await setupAndroidChannel()

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId

  try {
    if (projectId) {
      return (await Notifications.getExpoPushTokenAsync({ projectId })).data
    }
    const raw = await Notifications.getDevicePushTokenAsync()
    return typeof raw.data === 'string' ? raw.data : JSON.stringify(raw.data)
  } catch {
    return null
  }
}

// 이미 허용된 경우 토큰만 조용히 가져옴 (OS 다이얼로그 없음)
async function getTokenIfGranted(): Promise<string | null> {
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') return null
  return getPushToken()
}

// 테스트용 로컬 알림 — 3초 뒤 발송
export async function scheduleTestNotification(): Promise<void> {
  await setupAndroidChannel()
  const { status: existing } = await Notifications.getPermissionsAsync()
  const finalStatus = existing === 'granted'
    ? existing
    : (await Notifications.requestPermissionsAsync()).status
  if (finalStatus !== 'granted') return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '테스트 알림 🔔',
      body: '알림이 정상적으로 동작하고 있어요.',
      data: { category: 'expiry', url: '/fridges/1/items/i1' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
  })
}

// 웹의 request_push_permission 메시지 수신 시 호출 — OS 다이얼로그 표시
export async function requestPermissionAndGetToken(): Promise<string | null> {
  if (!Device.isDevice) return null
  const { status: existing } = await Notifications.getPermissionsAsync()
  const { status } = existing === 'granted'
    ? { status: existing }
    : await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return null
  return getPushToken()
}

// 웹으로 메시지 주입하는 헬퍼
function injectToWeb(webViewRef: React.RefObject<WebView | null>, data: object) {
  webViewRef.current?.injectJavaScript(`
    (function(){
      window.dispatchEvent(new MessageEvent('message', {
        data: ${JSON.stringify(JSON.stringify(data))}
      }));
    })();
    true;
  `)
}

interface NotificationSetupOptions {
  webViewRef: React.RefObject<WebView | null>
  onNavigate?: (path: string) => void
}

export function useNotificationSetup(
  webViewRefOrOptions: React.RefObject<WebView | null> | NotificationSetupOptions,
) {
  const tokenSent = useRef(false)

  const webViewRef = 'current' in webViewRefOrOptions
    ? webViewRefOrOptions
    : webViewRefOrOptions.webViewRef
  const onNavigate = 'current' in webViewRefOrOptions
    ? undefined
    : webViewRefOrOptions.onNavigate

  // 이미 허용된 경우 조용히 토큰 가져와 웹으로 전송
  useEffect(() => {
    let active = true
    getTokenIfGranted().then((token: string | null) => {
      if (!active || !token || tokenSent.current) return
      injectToWeb(webViewRef, { type: 'push_token', token })
      tokenSent.current = true
    })
    return () => { active = false }
  }, [webViewRef])

  // 알림 탭 → 웹 페이지 이동
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url as string | undefined
      if (url) {
        if (onNavigate) {
          onNavigate(url)
        } else {
          injectToWeb(webViewRef, { type: 'navigate', url })
        }
      }
    })
    return () => sub.remove()
  }, [webViewRef, onNavigate])
}
