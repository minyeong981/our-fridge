import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from '@/lib/supabase'

export default function Index() {
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
      setChecking(false)
    })
  }, [])

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#4AB8CF" />
      </View>
    )
  }

  return <Redirect href={hasSession ? '/(tabs)/home' : '/login'} />
}
