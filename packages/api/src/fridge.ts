import type {
  CreateFridgeInput,
  Fridge,
  Membership,
  MemberRole,
  UpdateFridgeInput,
} from '@our-fridge/shared'
import { supabase } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FridgeWithMeta = Fridge & {
  role: MemberRole
  memberCount: number
}

export type MemberWithProfile = Membership & {
  name: string | null
  avatarUrl: string | null
}

// ─── Fridges ──────────────────────────────────────────────────────────────────

function mapFridge(f: any): Fridge {
  return {
    id: f.id,
    emoji: f.emoji ?? null,
    name: f.name,
    location: f.location ?? null,
    description: f.description ?? null,
    rules: f.rules ?? null,
    notice: f.notice ?? null,
    createdBy: f.created_by ?? null,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  }
}

export async function getFridge(fridgeId: string): Promise<Fridge> {
  const { data, error } = await supabase
    .from('fridges')
    .select('*')
    .eq('id', fridgeId)
    .single()

  if (error) throw error
  return mapFridge(data)
}

export async function getUserFridges(userId: string): Promise<FridgeWithMeta[]> {
  // 1단계: 유저의 멤버십 조회
  const { data: memberships, error: memError } = await supabase
    .from('memberships')
    .select('fridge_id, role')
    .eq('user_id', userId)

  if (memError) throw memError
  if (!memberships || memberships.length === 0) return []

  const fridgeIds = memberships.map((m: any) => m.fridge_id)

  // 2단계: 냉장고 상세 조회
  const { data: fridges, error: fridgeError } = await supabase
    .from('fridges')
    .select('*')
    .in('id', fridgeIds)

  if (fridgeError) throw fridgeError

  // 3단계: 냉장고별 멤버 수 조회
  const { data: allMembers } = await supabase
    .from('memberships')
    .select('fridge_id')
    .in('fridge_id', fridgeIds)

  const memberCounts = (allMembers ?? []).reduce((acc: Record<string, number>, m: any) => {
    acc[m.fridge_id] = (acc[m.fridge_id] ?? 0) + 1
    return acc
  }, {})

  return memberships.map((m: any) => {
    const fridge = (fridges ?? []).find((f: any) => f.id === m.fridge_id)
    if (!fridge) return null
    return {
      ...mapFridge(fridge),
      role: m.role as MemberRole,
      memberCount: memberCounts[m.fridge_id] ?? 0,
    }
  }).filter(Boolean) as FridgeWithMeta[]
}

export async function createFridge(input: CreateFridgeInput): Promise<Fridge> {
  const { data, error } = await supabase
    .from('fridges')
    .insert({
      name: input.name,
      emoji: input.emoji ?? null,
      location: input.location ?? null,
      description: input.description ?? null,
      rules: input.rules ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return mapFridge(data)
}

export async function updateFridge(fridgeId: string, input: UpdateFridgeInput): Promise<Fridge> {
  const patch: Record<string, any> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.emoji !== undefined) patch.emoji = input.emoji
  if (input.location !== undefined) patch.location = input.location
  if (input.description !== undefined) patch.description = input.description
  if (input.rules !== undefined) patch.rules = input.rules
  if (input.notice !== undefined) patch.notice = input.notice

  const { data, error } = await supabase
    .from('fridges')
    .update(patch)
    .eq('id', fridgeId)
    .select()
    .single()

  if (error) throw error
  return mapFridge(data)
}

export async function deleteFridge(fridgeId: string): Promise<void> {
  const { error } = await supabase.from('fridges').delete().eq('id', fridgeId)
  if (error) throw error
}

// ─── Memberships ──────────────────────────────────────────────────────────────

export async function getMembersByFridge(fridgeId: string): Promise<MemberWithProfile[]> {
  const { data: memberships, error } = await supabase
    .from('memberships')
    .select('id, user_id, fridge_id, role, created_at')
    .eq('fridge_id', fridgeId)
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!memberships || memberships.length === 0) return []

  const userIds = memberships.map((m: any) => m.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]))

  return memberships.map((m: any) => ({
    id: m.id,
    userId: m.user_id,
    fridgeId: m.fridge_id,
    role: m.role,
    createdAt: m.created_at,
    name: profileMap[m.user_id]?.name ?? null,
    avatarUrl: profileMap[m.user_id]?.avatar_url ?? null,
  }))
}

export async function addMember(
  fridgeId: string,
  userId: string,
  role: MemberRole = 'member',
): Promise<Membership> {
  const { data, error } = await supabase
    .from('memberships')
    .insert({ fridge_id: fridgeId, user_id: userId, role })
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id,
    fridgeId: data.fridge_id,
    role: data.role,
    createdAt: data.created_at,
  }
}

export async function updateMemberRole(
  fridgeId: string,
  userId: string,
  role: MemberRole,
): Promise<Membership> {
  const { data, error } = await supabase
    .from('memberships')
    .update({ role })
    .eq('fridge_id', fridgeId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return {
    id: data.id,
    userId: data.user_id,
    fridgeId: data.fridge_id,
    role: data.role,
    createdAt: data.created_at,
  }
}

export async function removeMember(fridgeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('fridge_id', fridgeId)
    .eq('user_id', userId)
  if (error) throw error
}
