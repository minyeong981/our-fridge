import type { WebView } from 'react-native-webview'
import type React from 'react'
import {
  requestPermissionAndGetToken,
  scheduleTestNotification,
  updateNotifHandlerSettings,
  type NotifSettings,
} from './useNotificationSetup'

async function pickImage(source: 'camera' | 'gallery'): Promise<string | null> {
  const ImagePicker = await import('expo-image-picker')
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') return null
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    })
    if (result.canceled) return null
    return result.assets[0].base64 ?? null
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return null
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    })
    if (result.canceled) return null
    return result.assets[0].base64 ?? null
  }
}

function injectMessage(webViewRef: React.RefObject<WebView | null>, data: object) {
  webViewRef.current?.injectJavaScript(`
    (function(){
      window.dispatchEvent(new MessageEvent('message', {
        data: ${JSON.stringify(JSON.stringify(data))}
      }));
    })();
    true;
  `)
}

export function handleWebMessage(
  webViewRef: React.RefObject<WebView | null>,
  data: string,
  onLogout?: () => void,
) {
  try {
    const msg = JSON.parse(data)

    if (msg.type === 'notif_settings') {
      updateNotifHandlerSettings(msg.data as NotifSettings)
    } else if (msg.type === 'test_notification') {
      scheduleTestNotification()
    } else if (msg.type === 'pick_image') {
      const source = (msg.data?.source ?? msg.source) as 'camera' | 'gallery'
      pickImage(source).then((base64) => {
        if (!base64) return
        injectMessage(webViewRef, { type: 'image_picked', base64 })
      })
    } else if (msg.type === 'request_push_permission') {
      requestPermissionAndGetToken().then((token) => {
        if (!token) return
        injectMessage(webViewRef, { type: 'push_token', token })
      })
    } else if (msg.type === 'logout') {
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.auth.signOut().then(() => onLogout?.())
      })
    }
  } catch {
    // 파싱 실패 무시
  }
}
