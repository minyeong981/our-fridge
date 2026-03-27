import { useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'

WebBrowser.maybeCompleteAuthSession()

const REDIRECT_URL = 'ourfridge://auth/callback'

async function signInWithProvider(provider: 'google' | 'kakao'): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: REDIRECT_URL,
      skipBrowserRedirect: true,
      ...(provider === 'kakao' && { scopes: 'profile_nickname profile_image' }),
    },
  })
  if (error || !data.url) return false

  const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL)
  if (result.type !== 'success' || !result.url) return false

  // 리다이렉트 URL에서 토큰 추출
  const parsed = Linking.parse(result.url)
  const params = parsed.queryParams as Record<string, string> | undefined

  const access_token = params?.access_token
  const refresh_token = params?.refresh_token

  if (!access_token || !refresh_token) {
    // hash fragment 방식 (access_token이 # 뒤에 있을 경우)
    const hash = result.url.split('#')[1] ?? ''
    const hashParams = Object.fromEntries(new URLSearchParams(hash))
    if (hashParams.access_token && hashParams.refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: hashParams.access_token,
        refresh_token: hashParams.refresh_token,
      })
      return !sessionError
    }
    return false
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  })
  return !sessionError
}

export default function LoginScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState<'google' | 'kakao' | null>(null)

  const handleLogin = async (provider: 'google' | 'kakao') => {
    setLoading(provider)
    try {
      const ok = await signInWithProvider(provider)
      if (ok) {
        router.replace('/(tabs)/home')
      } else {
        Alert.alert('로그인 실패', '다시 시도해 주세요.')
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 로고 */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Image source={require('../assets/images/our-fridge-icon.png')} style={styles.logoImage} />
          </View>
          <Text style={styles.title}>우리의 냉장고</Text>
          <Text style={styles.subtitle}>공용 냉장고를 함께 관리해요</Text>
        </View>

        {/* 로그인 버튼 */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.kakaoButton}
            onPress={() => handleLogin('kakao')}
            disabled={loading !== null}
            activeOpacity={0.85}
          >
            {loading === 'kakao' ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <>
                <KakaoIcon />
                <Text style={styles.kakaoText}>카카오로 시작하기</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => handleLogin('google')}
            disabled={loading !== null}
            activeOpacity={0.85}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#444444" />
            ) : (
              <>
                <GoogleIcon />
                <Text style={styles.googleText}>구글로 시작하기</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          로그인 시 서비스 이용약관 및{'\n'}개인정보처리방침에 동의하게 됩니다.
        </Text>
      </View>
    </SafeAreaView>
  )
}

// ── 아이콘 ──────────────────────────────────────────────────

function GoogleIcon() {
  const { Svg, Path } = require('react-native-svg')
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <Path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <Path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <Path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </Svg>
  )
}

function KakaoIcon() {
  const { Svg, Path } = require('react-native-svg')
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1C4.582 1 1 3.896 1 7.468c0 2.282 1.515 4.282 3.797 5.433L3.93 16.16a.25.25 0 0 0 .375.272L8.49 13.9c.17.012.34.018.51.018 4.418 0 8-2.896 8-6.468C17 3.896 13.418 1 9 1Z"
        fill="#191919"
      />
    </Svg>
  )
}

// ── 스타일 ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EBF8FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoImage: {
    width: 64,
    height: 64,
  },
title: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  buttons: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FEE500',
  },
  kakaoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
    color: '#191919',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
    color: '#374151',
  },
  legal: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 32,
  },
})
