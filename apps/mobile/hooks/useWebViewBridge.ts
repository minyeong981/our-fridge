import { Appearance, Alert } from 'react-native'
import * as Linking from 'expo-linking'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { WebView } from 'react-native-webview'
import type React from 'react'
import type { WebToRNMessage } from '@our-fridge/shared'
import {
  requestPermissionAndGetToken,
  updateNotifHandlerSettings,
} from './useNotificationSetup'

async function pickImage(source: 'camera' | 'gallery'): Promise<string | null> {
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
    const msg = JSON.parse(data) as WebToRNMessage

    if (msg.type === 'notif_settings') {
      updateNotifHandlerSettings(msg.data)
    } else if (msg.type === 'pick_image') {
      pickImage(msg.source).then((base64) => {
        if (!base64) return
        injectMessage(webViewRef, { type: 'image_picked', base64 })
      })
    } else if (msg.type === 'request_push_permission') {
      requestPermissionAndGetToken().then((token) => {
        if (!token) return
        injectMessage(webViewRef, { type: 'push_token', token })
      })
    } else if (msg.type === 'auth_failed') {
      Alert.alert('로그인 실패', '로그인 중 오류가 발생했어요. 다시 시도해 주세요.')
      onLogout?.()
    } else if (msg.type === 'logout') {
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.auth.signOut().then(() => onLogout?.())
      })
    } else if (msg.type === 'theme_change') {
      const scheme = msg.theme === 'dark' ? 'dark' : msg.theme === 'light' ? 'light' : null
      Appearance.setColorScheme(scheme as 'dark' | 'light' | null)
      AsyncStorage.setItem('app_theme', msg.theme)
    } else if (msg.type === 'open_url' && typeof msg.url === 'string') {
      Linking.openURL(msg.url)
    }
  } catch {
    // 파싱 실패 무시
  }
}
