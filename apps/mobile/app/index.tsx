import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3000'

export default function HomeScreen() {
  return <WebView source={{ uri: WEB_URL }} style={StyleSheet.absoluteFill} />
}
