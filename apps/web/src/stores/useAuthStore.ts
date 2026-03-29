import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@our-fridge/shared'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  termsAgreed: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setTermsAgreed: (agreed: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  termsAgreed: true, // 프로필 로드 후 판단
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setTermsAgreed: (agreed) => set({ termsAgreed: agreed }),
}))
