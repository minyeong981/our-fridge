import { useRef, useCallback } from 'react'
import type React from 'react'
import { BackHandler, StyleSheet, View, ActivityIndicator, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview'
import { useFocusEffect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { handleWebMessage } from '@/hooks/useWebViewBridge'
import { WEB_URL } from '@/lib/webViewRefs'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 OurFridgeApp/1.0'

interface TabWebViewProps {
  readonly path: string
  readonly webViewRef: React.RefObject<WebView | null>
  readonly onBackToHome?: () => void
  readonly onLogout?: () => void
}

export function TabWebView({ path, webViewRef, onBackToHome, onLogout }: TabWebViewProps) {
  const canGoBackRef = useRef(false)
  const isDark = useColorScheme() === 'dark'

  // 세션 주입 — WebView 로드 완료 시
  const handleLoadEnd = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return
    const { access_token, refresh_token } = data.session
    webViewRef.current?.injectJavaScript(`
      (function() {
        if (window.__RN_SESSION_INJECTED__) return;
        window.__RN_SESSION_INJECTED__ = true;
        window.__RN_SESSION__ = ${JSON.stringify({ access_token, refresh_token })};
        window.dispatchEvent(new CustomEvent('rn-session-ready'));
      })();
      true;
    `)
  }, [webViewRef, path])

  // Android 뒤로가기 — 탭이 포커스될 때만 등록
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBackRef.current) {
          webViewRef.current?.goBack()
          return true
        }
        if (onBackToHome) {
          onBackToHome()
          return true
        }
        return false
      })
      return () => sub.remove()
    }, [webViewRef, onBackToHome]),
  )

  const handleNavigationStateChange = (state: WebViewNavigation) => {
    canGoBackRef.current = state.canGoBack
  }

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    handleWebMessage(webViewRef, event.nativeEvent.data, onLogout)
  }

  const bg = isDark ? '#1C1C1E' : '#ffffff'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <WebView
        ref={webViewRef}
        source={{ uri: `${WEB_URL}${path}` }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        userAgent={USER_AGENT}
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loading, { backgroundColor: bg }]}>
            <ActivityIndicator size="large" color="#4AB8CF" />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
