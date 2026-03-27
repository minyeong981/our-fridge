import type { Profile, UpsertProfileInput } from '@our-fridge/shared'
import { supabase } from './client'

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export function onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return {
    id: data.id,
    name: data.name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function savePushToken(token: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('push_tokens').upsert({
    user_id: user.id,
    token,
    updated_at: new Date().toISOString(),
  })
}

export async function upsertProfile(userId: string, input: UpsertProfileInput): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.avatarUrl !== undefined && { avatar_url: input.avatarUrl }),
      updated_at: new Date().toISOString(),
    })
  if (error) throw error
}
