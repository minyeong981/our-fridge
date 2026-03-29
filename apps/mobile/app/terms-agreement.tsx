import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'

const TERMS_KEY = 'terms_agreed_v1'
const TERMS_URL = 'https://www.notion.so/3300d8d7efe380b59bfce25f34226368'
const PRIVACY_URL = 'https://www.notion.so/3300d8d7efe380a79f3dcfc9ea0c7274'

export default function TermsAgreementScreen() {
  const router = useRouter()
  const [checkedTerms, setCheckedTerms] = useState(false)
  const [checkedPrivacy, setCheckedPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)

  const allChecked = checkedTerms && checkedPrivacy

  function toggleAll() {
    const next = !allChecked
    setCheckedTerms(next)
    setCheckedPrivacy(next)
  }

  async function handleAgree() {
    if (!allChecked) return
    setLoading(true)
    try {
      await AsyncStorage.setItem(TERMS_KEY, 'true')

      // DB에도 동의 시각 기록
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ terms_agreed_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      router.replace('/(tabs)/home')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <View style={styles.header}>
          <Text style={styles.title}>서비스 이용 동의</Text>
          <Text style={styles.subtitle}>
            우리의 냉장고를 시작하기 전에{'\n'}아래 내용을 확인해주세요.
          </Text>
        </View>

        {/* 전체 동의 */}
        <TouchableOpacity style={styles.allRow} onPress={toggleAll} activeOpacity={0.7}>
          <View style={[styles.circle, allChecked && styles.circleActive]}>
            {allChecked && <Text style={styles.check}>✓</Text>}
          </View>
          <Text style={styles.allLabel}>전체 동의</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* 이용약관 */}
        <View style={styles.itemRow}>
          <TouchableOpacity
            style={[styles.circle, checkedTerms && styles.circleActive]}
            onPress={() => setCheckedTerms(v => !v)}
            activeOpacity={0.7}
          >
            {checkedTerms && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.itemLabel}>
            <Text style={styles.required}>[필수] </Text>이용약관 동의
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={styles.viewLink}>보기</Text>
          </TouchableOpacity>
        </View>

        {/* 개인정보처리방침 */}
        <View style={styles.itemRow}>
          <TouchableOpacity
            style={[styles.circle, checkedPrivacy && styles.circleActive]}
            onPress={() => setCheckedPrivacy(v => !v)}
            activeOpacity={0.7}
          >
            {checkedPrivacy && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.itemLabel}>
            <Text style={styles.required}>[필수] </Text>개인정보처리방침 동의
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.viewLink}>보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.button, !allChecked && styles.buttonDisabled]}
            onPress={handleAgree}
            disabled={!allChecked || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={[styles.buttonText, !allChecked && styles.buttonTextDisabled]}>
                  동의하고 시작하기
                </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  header: { paddingTop: 48, paddingBottom: 40 },
  title: { fontSize: 22, fontFamily: 'Pretendard-Bold', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 14, fontFamily: 'Pretendard-Regular', color: '#6B7280', lineHeight: 22 },

  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  allLabel: { fontSize: 15, fontFamily: 'Pretendard-Bold', color: '#111827' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 8 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  itemLabel: { flex: 1, fontSize: 14, fontFamily: 'Pretendard-Regular', color: '#374151' },
  required: { color: '#9CA3AF' },
  viewLink: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },

  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: { backgroundColor: '#4AB8CF', borderColor: '#4AB8CF' },
  check: { color: '#fff', fontSize: 12, fontFamily: 'Pretendard-Bold' },

  bottom: { flex: 1, justifyContent: 'flex-end', paddingBottom: 16, paddingTop: 32 },
  button: {
    backgroundColor: '#4AB8CF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#F3F4F6' },
  buttonText: { fontSize: 16, fontFamily: 'Pretendard-Bold', color: '#fff' },
  buttonTextDisabled: { color: '#9CA3AF' },
})
