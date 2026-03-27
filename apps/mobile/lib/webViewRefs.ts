import { createRef } from 'react'
import type React from 'react'
import type { WebView } from 'react-native-webview'

export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://10.0.2.2:3000'

// 각 탭의 WebView ref — 항상 마운트되므로 모듈 레벨에서 관리
export const homeWebViewRef = createRef<WebView>()
export const communityWebViewRef = createRef<WebView>()
export const myWebViewRef = createRef<WebView>()

// 현재 활성 탭
export let activeTab: 'home' | 'community' | 'my' = 'home'
export function setActiveTab(tab: typeof activeTab) {
  activeTab = tab
}

// 특정 탭의 WebView에 URL 이동
export function navigateWebView(tab: 'home' | 'community' | 'my', path: string) {
  const ref =
    tab === 'home' ? homeWebViewRef :
    tab === 'community' ? communityWebViewRef :
    myWebViewRef
  ref.current?.injectJavaScript(
    `window.location.href = ${JSON.stringify(WEB_URL + path)}; true;`
  )
}

// 활성 탭의 WebView에 메시지 주입
export function injectToActive(js: string) {
  const ref =
    activeTab === 'home' ? homeWebViewRef :
    activeTab === 'community' ? communityWebViewRef :
    myWebViewRef
  ref.current?.injectJavaScript(js)
}

// 특정 WebView의 알림 패널 닫기 (탭 전환 시 호출)
export function dispatchClosePanel(ref: React.RefObject<import('react-native-webview').WebView | null>) {
  ref.current?.injectJavaScript(`
    (function(){
      window.dispatchEvent(new MessageEvent('message', {
        data: ${JSON.stringify(JSON.stringify({ type: 'close_panel' }))}
      }));
    })();
    true;
  `)
}
