import { useRef, useCallback, useState, useEffect } from 'react'
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
  const bg = isDark ? '#1C1C1E' : '#ffffff'

  // null = 아직 세션 조회 전, string = 준비 완료 (빈 문자열이면 세션 없음)
  const [preloadScript, setPreloadScript] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const { access_token, refresh_token } = data.session
        setPreloadScript(
          `window.__RN_SESSION__=${JSON.stringify({ access_token, refresh_token })};window.__RN_SESSION_INJECTED__=true;true;`,
        )
      } else {
        setPreloadScript('')
      }
    })
  }, [])

  // onLoadEnd: preloadScript가 없는 경우의 폴백, 또는 토큰 갱신 후 재주입
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

  if (preloadScript === null) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <View style={[styles.loading, { backgroundColor: bg }]}>
          <ActivityIndicator size="large" color="#4AB8CF" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <WebView
        ref={webViewRef}
        source={{ uri: `${WEB_URL}${path}` }}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={preloadScript || undefined}
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
