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

export type FridgeNeedingDelegation = {
  fridgeId: string
  fridgeName: string
  members: { userId: string; name: string | null; avatarUrl: string | null }[]
}

export async function getAdminFridgesNeedingDelegation(): Promise<FridgeNeedingDelegation[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 유저가 owner/admin인 멤버십 조회
  const { data: myMemberships } = await supabase
    .from('memberships')
    .select('fridge_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])

  if (!myMemberships || myMemberships.length === 0) return []

  const fridgeIds = myMemberships.map((m: any) => m.fridge_id)

  // 해당 냉장고들의 모든 멤버십 조회
  const { data: allMemberships } = await supabase
    .from('memberships')
    .select('fridge_id, user_id, role')
    .in('fridge_id', fridgeIds)

  // 냉장고별로 그룹핑
  const fridgeMap: Record<string, { admins: string[]; members: string[] }> = {}
  for (const m of allMemberships ?? []) {
    if (!fridgeMap[m.fridge_id]) fridgeMap[m.fridge_id] = { admins: [], members: [] }
    if (m.role === 'owner' || m.role === 'admin') {
      fridgeMap[m.fridge_id].admins.push(m.user_id)
    } else {
      fridgeMap[m.fridge_id].members.push(m.user_id)
    }
  }

  // 내가 유일한 admin/owner이고 다른 멤버가 있는 냉장고만 필터
  const needsDelegation = fridgeIds.filter((fridgeId: string) => {
    const group = fridgeMap[fridgeId]
    if (!group) return false
    const otherAdmins = group.admins.filter((id) => id !== user.id)
    return otherAdmins.length === 0 && group.members.length > 0
  })

  if (needsDelegation.length === 0) return []

  // 냉장고 이름 + 위임 대상 멤버 조회
  const { data: fridges } = await supabase
    .from('fridges')
    .select('id, name')
    .in('id', needsDelegation)

  const delegatableMemberIds = needsDelegation.flatMap(
    (fridgeId: string) => fridgeMap[fridgeId]?.members ?? [],
  )
  const uniqueIds = [...new Set(delegatableMemberIds)]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', uniqueIds)

  const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]))

  return needsDelegation.map((fridgeId: string) => {
    const fridge = (fridges ?? []).find((f: any) => f.id === fridgeId)
    const memberIds = fridgeMap[fridgeId]?.members ?? []
    return {
      fridgeId,
      fridgeName: fridge?.name ?? '',
      members: memberIds.map((uid: string) => ({
        userId: uid,
        name: profileMap[uid]?.name ?? null,
        avatarUrl: profileMap[uid]?.avatar_url ?? null,
      })),
    }
  })
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account')
  if (error) throw error
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
