'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@our-fridge/shared'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // RN WebView 세션 주입 처리
    const handleRNSession = async () => {
      const rnSession = (window as any).__RN_SESSION__
      if (rnSession?.access_token && rnSession?.refresh_token) {
        await supabase.auth.setSession({
          access_token: rnSession.access_token,
          refresh_token: rnSession.refresh_token,
        })
      }
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        // 브라우저 쿠키에 세션 있음
        setUser(data.session.user)
        loadProfile(supabase, data.session.user.id)
      } else if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
        // RN WebView — rn-session-ready 이벤트까지 loading 유지
      } else {
        // 일반 브라우저 — 세션 없음
        setLoading(false)
      }
    })

    // RN 세션 주입 이벤트 리스너
    const onRNSessionReady = async () => {
      await handleRNSession()
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user ?? null
        setUser(u)
        if (u) loadProfile(supabase, u.id)
        else setLoading(false)
      })
    }
    window.addEventListener('rn-session-ready', onRNSessionReady)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadProfile(supabase, u.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('rn-session-ready', onRNSessionReady)
    }
  }, [])

  async function loadProfile(supabase: ReturnType<typeof createClient>, userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile({
        id: data.id,
        name: data.name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      })
    }
    setLoading(false)
  }

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
