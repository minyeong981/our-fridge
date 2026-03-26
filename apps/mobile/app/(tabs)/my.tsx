import { TabWebView } from '@/components/TabWebView'
import { myWebViewRef } from '@/lib/webViewRefs'

export default function MyTab() {
  return <TabWebView path="/my" webViewRef={myWebViewRef} />
}
