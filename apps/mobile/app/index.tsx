import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'

const TERMS_KEY = 'terms_agreed_v1'

export default function Index() {
  const [checking, setChecking] = useState(true)
  const [dest, setDest] = useState<'/(tabs)/home' | '/login' | '/terms-agreement'>('/login')
  const isDark = useColorScheme() === 'dark'

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setDest('/login')
      } else {
        const agreed = await AsyncStorage.getItem(TERMS_KEY)
        setDest(agreed ? '/(tabs)/home' : '/terms-agreement')
      }
      setChecking(false)
    }
    check()
  }, [])

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#1C1C1E' : '#ffffff' }}>
        <ActivityIndicator size="large" color="#4AB8CF" />
      </View>
    )
  }

  return <Redirect href={dest} />
}
