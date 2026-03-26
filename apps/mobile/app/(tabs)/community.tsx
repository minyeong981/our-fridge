import { TabWebView } from '@/components/TabWebView'
import { communityWebViewRef } from '@/lib/webViewRefs'

export default function CommunityTab() {
  return <TabWebView path="/community" webViewRef={communityWebViewRef} />
}
