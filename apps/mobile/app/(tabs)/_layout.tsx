import { useEffect } from 'react'
import { useColorScheme, Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Tabs, useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { setActiveTab, navigateWebView, dispatchClosePanel, injectToActive, homeWebViewRef, communityWebViewRef, myWebViewRef } from '@/lib/webViewRefs'
import { useNotificationSetup } from '@/hooks/useNotificationSetup'

function toWebPath(url: string): string {
  if (url.startsWith('http')) {
    const { pathname, search } = new URL(url)
    return pathname + search
  }
  const parsed = Linking.parse(url)
  const parts = [parsed.hostname, parsed.path].filter(Boolean)
  return '/' + parts.join('/')
}

function pathToTab(path: string): 'home' | 'community' | 'my' {
  if (path.startsWith('/community')) return 'community'
  if (path.startsWith('/my')) return 'my'
  return 'home'
}

function navigateToPath(router: ReturnType<typeof useRouter>, path: string) {
  const tab = pathToTab(path)
  const tabRoute = tab === 'home' ? '/(tabs)/home' : tab === 'community' ? '/(tabs)/community' : '/(tabs)/my'
  router.navigate(tabRoute as any)
  setActiveTab(tab)
  // 탭 전환 후 URL 주입 (짧은 딜레이로 WebView가 준비되길 기다림)
  setTimeout(() => {
    navigateWebView(tab, path)
  }, 100)
}

export default function TabLayout() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  // 저장된 테마 복원
  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((saved) => {
      if (saved === 'dark') Appearance.setColorScheme('dark')
      else if (saved === 'light') Appearance.setColorScheme('light')
      else if (saved === 'system') Appearance.setColorScheme(null)
    })
  }, [])

  // 알림 채널 설정 + 토큰 전송
  useNotificationSetup({
    webViewRef: homeWebViewRef,
    onNavigate: (path) => navigateToPath(router, path),
  })

  // 딥링크
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) navigateToPath(router, toWebPath(url))
    })
    const sub = Linking.addEventListener('url', ({ url }) => {
      navigateToPath(router, toWebPath(url))
    })
    return () => sub.remove()
  }, [router])

  // 알림 탭 → 탭 이동 + URL 주입
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url as string | undefined
      if (url) navigateToPath(router, url)
    })
    return () => sub.remove()
  }, [router])

  // 포그라운드 알림 수신 → 웹 알림 목록에 추가
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content
      const category = data?.category as string | undefined
      const url = data?.url as string | undefined
      const typeMap: Record<string, string> = {
        expiry: 'expiry', notice: 'notice', comment: 'comment', invite: 'invite',
      }
      const msg = JSON.stringify({
        type: 'push_notification',
        notification: {
          id: `push_${Date.now()}`,
          type: typeMap[category ?? ''] ?? 'item',
          title: title ?? '',
          body: body ?? '',
          createdAt: new Date().toISOString(),
          isRead: false,
          link: url,
        },
      })
      const js = `
        (function(){
          window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(msg)} }));
        })();
        true;
      `
      injectToActive(js)
    })
    return () => sub.remove()
  }, [])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4AB8CF',
        tabBarInactiveTintColor: isDark ? '#6B7280' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#ffffff',
          borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Pretendard-SemiBold',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="fridge-outline" size={size} color={color} />,
        }}
        listeners={{ focus: () => setActiveTab('home'), blur: () => dispatchClosePanel(homeWebViewRef) }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
        listeners={{ focus: () => setActiveTab('community'), blur: () => dispatchClosePanel(communityWebViewRef) }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '마이',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
        listeners={{ focus: () => setActiveTab('my'), blur: () => dispatchClosePanel(myWebViewRef) }}
      />
    </Tabs>
  )
}
