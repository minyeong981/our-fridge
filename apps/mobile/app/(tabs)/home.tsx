import { TabWebView } from '@/components/TabWebView'
import { homeWebViewRef } from '@/lib/webViewRefs'

export default function HomeTab() {
  return <TabWebView path="/fridges" webViewRef={homeWebViewRef} />
}
