import { AntDesign } from '@expo/vector-icons'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 로고 영역 */}
      <View style={styles.logoSection}>
        <View style={styles.iconWrapper}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>우리의 냉장고</Text>
        <Text style={styles.subtitle}>공용 냉장고 관리 서비스</Text>
      </View>

      {/* 하단 버튼 영역 */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.kakaoButton} activeOpacity={0.85}>
          <KakaoIcon />
          <Text style={styles.kakaoText}>카카오로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
          <AntDesign name="google" size={18} color="#4285F4" />
          <Text style={styles.googleText}>구글로 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

/** 카카오 공식 말풍선 아이콘 (View 구현) */
function KakaoIcon() {
  return (
    <View style={kakaoStyles.container}>
      <View style={kakaoStyles.bubble} />
      <View style={kakaoStyles.tail} />
    </View>
  )
}

const kakaoStyles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: 20,
    height: 18,
    backgroundColor: '#3A1D1D',
    borderRadius: 9,
  },
  tail: {
    position: 'absolute',
    bottom: 0,
    left: 5,
    width: 6,
    height: 6,
    backgroundColor: '#3A1D1D',
    borderBottomRightRadius: 5,
    transform: [{ rotate: '-15deg' }],
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FB',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#4AB8CF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  title: {
    fontFamily: 'Pretendard-ExtraBold',
    fontSize: 26,
    color: '#1A2E42',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#8FA3B8',
    letterSpacing: -0.2,
  },
  buttonSection: {
    gap: 12,
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE500',
    borderRadius: 14,
    height: 54,
    gap: 8,
  },
  kakaoText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 54,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DDE4EC',
  },
  googleText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    color: '#4A5568',
    letterSpacing: -0.3,
  },
})
