import { useRef } from 'react'
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView, WebViewNavigation } from 'react-native-webview'
import { useEffect } from 'react'

// Android 에뮬레이터: 10.0.2.2 | iOS 시뮬레이터·실기기: 호스트 IP
const WEB_URL = 'http://10.0.2.2:3000'

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null)
  const canGoBackRef = useRef(false)

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
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
