import { useRouter } from 'expo-router'
import { TabWebView } from '@/components/TabWebView'
import { myWebViewRef } from '@/lib/webViewRefs'

export default function MyTab() {
  const router = useRouter()
  return <TabWebView path="/my" webViewRef={myWebViewRef} onLogout={() => router.replace('/login')} />
}
