import { useEffect } from 'react'
import { useColorScheme, Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Tabs, useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import type { NotifType, RNToWebMessage } from '@our-fridge/shared'
import { setActiveTab, navigateWebView, dispatchClosePanel, injectToActive, homeWebViewRef, communityWebViewRef, myWebViewRef } from '@/lib/webViewRefs'
import { useNotificationSetup } from '@/hooks/useNotificationSetup'

function toWebPath(url: string): string {
  if (url.startsWith('http')) {
    return url.replace(/^https?:\/\/[^/]+/, '') || '/'
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

const TAB_ROUTES: Record<'home' | 'community' | 'my', string> = {
  home: '/(tabs)/home',
  community: '/(tabs)/community',
  my: '/(tabs)/my',
}

function navigateToPath(router: ReturnType<typeof useRouter>, path: string) {
  const tab = pathToTab(path)
  router.navigate(TAB_ROUTES[tab] as any)
  setActiveTab(tab)
  setTimeout(() => { navigateWebView(tab, path) }, 100)
}

function HomeIcon({ color, size }: { color: string; size: number }) {
  return <MaterialCommunityIcons name="fridge-outline" size={size} color={color} />
}
function CommunityIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="people-outline" size={size} color={color} />
}
function MyIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="person-outline" size={size} color={color} />
}

export default function TabLayout() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((saved) => {
      if (saved === 'dark') Appearance.setColorScheme('dark')
      else if (saved === 'light') Appearance.setColorScheme('light')
      else if (saved === 'system') Appearance.setColorScheme(null)
    })
  }, [])

  useNotificationSetup({
    webViewRef: homeWebViewRef,
    onNavigate: (path) => navigateToPath(router, path),
  })

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url && !url.includes('auth/callback')) navigateToPath(router, toWebPath(url))
    })
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (!url.includes('auth/callback')) navigateToPath(router, toWebPath(url))
    })
    return () => sub.remove()
  }, [router])

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url as string | undefined
      if (url) navigateToPath(router, url)
    })
    return () => sub.remove()
  }, [router])

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content
      const category = data?.category as string | undefined
      const url = data?.url as string | undefined
      const typeMap: Record<string, NotifType> = {
        expiry: 'expiry', notice: 'notice', comment: 'comment', invite: 'invite',
      }
      const msg = JSON.stringify({
        type: 'push_notification',
        notification: {
          id: `push_${Date.now()}`,
          type: typeMap[category ?? ''] ?? ('item' as NotifType),
          title: title ?? '',
          body: body ?? '',
          createdAt: new Date().toISOString(),
          isRead: false,
          link: url,
        },
      } satisfies RNToWebMessage)
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
        options={{ title: '홈', tabBarIcon: HomeIcon }}
        listeners={{ focus: () => setActiveTab('home'), blur: () => dispatchClosePanel(homeWebViewRef) }}
      />
      <Tabs.Screen
        name="community"
        options={{ title: '커뮤니티', tabBarIcon: CommunityIcon }}
        listeners={{ focus: () => setActiveTab('community'), blur: () => dispatchClosePanel(communityWebViewRef) }}
      />
      <Tabs.Screen
        name="my"
        options={{ title: '마이', tabBarIcon: MyIcon }}
        listeners={{ focus: () => setActiveTab('my'), blur: () => dispatchClosePanel(myWebViewRef) }}
      />
    </Tabs>
  )
}
