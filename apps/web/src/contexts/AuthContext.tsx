'use client'

import { useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    const handleRNSession = async () => {
      const rnSession = (window as any).__RN_SESSION__
      if (rnSession?.access_token && rnSession?.refresh_token) {
        await supabase.auth.setSession({
          access_token: rnSession.access_token,
          refresh_token: rnSession.refresh_token,
        })
      }
    }

    async function loadProfile(userId: string) {
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

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setUser(data.session.user)
        loadProfile(data.session.user.id)
      } else if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
        // RN WebView — rn-session-ready 이벤트까지 loading 유지
      } else {
        setLoading(false)
      }
    })

    const onRNSessionReady = async () => {
      await handleRNSession()
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user ?? null
        setUser(u)
        if (u) loadProfile(u.id)
        else setLoading(false)
      })
    }
    window.addEventListener('rn-session-ready', onRNSessionReady)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadProfile(u.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('rn-session-ready', onRNSessionReady)
    }
  }, [setUser, setProfile, setLoading])

  return <>{children}</>
}

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)
  return { user, profile, loading }
}
