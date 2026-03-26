import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView, WebViewNavigation } from 'react-native-webview'
import * as Linking from 'expo-linking'
import {
  useNotificationSetup,
  updateNotifHandlerSettings,
  requestPermissionAndGetToken,
  scheduleTestNotification,
} from '@/hooks/useNotificationSetup'
import type { NotifSettings } from '@/hooks/useNotificationSetup'

// Android 에뮬레이터: 10.0.2.2 | 실기기(같은 WiFi): PC IP
const WEB_URL = 'http://192.168.45.52:3000'

function toWebPath(url: string): string {
  if (url.startsWith('http')) {
    const { pathname, search } = new URL(url)
    return pathname + search
  }
  // ourfridge://invite/CODE
  const parsed = Linking.parse(url)
  const parts = [parsed.hostname, parsed.path].filter(Boolean)
  return '/' + parts.join('/')
}

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

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null)
  const canGoBackRef = useRef(false)
  const [initialUri, setInitialUri] = useState(WEB_URL)

  useNotificationSetup(webViewRef)

  // 딥링크로 앱이 열렸을 때 해당 경로로 이동
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) setInitialUri(`${WEB_URL}${toWebPath(url)}`)
    })

    const sub = Linking.addEventListener('url', ({ url }) => {
      const path = toWebPath(url)
      webViewRef.current?.injectJavaScript(
        `window.location.href = ${JSON.stringify(WEB_URL + path)}; true;`
      )
    })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current) {
        webViewRef.current?.goBack()
        return true
      }
      return false
    })
    return () => subscription.remove()
  }, [])

  const handleNavigationStateChange = (state: WebViewNavigation) => {
    canGoBackRef.current = state.canGoBack
  }

  // 웹에서 오는 메시지 처리
  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data)
      if (msg.type === 'notif_settings') {
        updateNotifHandlerSettings(msg.data as NotifSettings)
      } else if (msg.type === 'test_notification') {
        scheduleTestNotification()
      } else if (msg.type === 'pick_image') {
        const source = msg.source as 'camera' | 'gallery'
        pickImage(source).then((base64) => {
          if (!base64) return
          webViewRef.current?.injectJavaScript(`
            (function(){
              window.dispatchEvent(new MessageEvent('message', {
                data: ${JSON.stringify(JSON.stringify({ type: 'image_picked', base64 }))}
              }));
            })();
            true;
          `)
        })
      } else if (msg.type === 'request_push_permission') {
        requestPermissionAndGetToken().then((token) => {
          if (!token) return
          webViewRef.current?.injectJavaScript(`
            (function(){
              window.dispatchEvent(new MessageEvent('message', {
                data: ${JSON.stringify(JSON.stringify({ type: 'push_token', token }))}
              }));
            })();
            true;
          `)
        })
      }
    } catch {
      // 파싱 실패는 무시
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        ref={webViewRef}
        source={{ uri: initialUri }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 OurFridgeApp/1.0"
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#4AB8CF" />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
})
