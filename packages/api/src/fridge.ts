import type {
  CreateFridgeInput,
  CreateSpaceInput,
  Fridge,
  Membership,
  MemberRole,
  Space,
  UpdateSpaceInput,
} from '@our-fridge/shared'
import { supabase } from './client'

// ─── Spaces ───────────────────────────────────────────────────────────────────

export async function getSpace(spaceId: string): Promise<Space> {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .single()

  if (error) throw error
  return data as Space
}

export async function createSpace(input: CreateSpaceInput): Promise<Space> {
  const { data, error } = await supabase
    .from('spaces')
    .insert({
      name: input.name,
      description: input.description ?? null,
      default_expire_days: input.defaultExpireDays ?? null,
      cleanup_message: input.cleanupMessage ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Space
}

export async function updateSpace(spaceId: string, input: UpdateSpaceInput): Promise<Space> {
  const { data, error } = await supabase
    .from('spaces')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.defaultExpireDays !== undefined && { default_expire_days: input.defaultExpireDays }),
      ...(input.cleanupMessage !== undefined && { cleanup_message: input.cleanupMessage }),
    })
    .eq('id', spaceId)
    .select()
    .single()

  if (error) throw error
  return data as Space
}

export async function deleteSpace(spaceId: string): Promise<void> {
  const { error } = await supabase.from('spaces').delete().eq('id', spaceId)
  if (error) throw error
}

// ─── Fridges ──────────────────────────────────────────────────────────────────

export async function getFridgesBySpace(spaceId: string): Promise<Fridge[]> {
  const { data, error } = await supabase
    .from('fridges')
    .select('*')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Fridge[]
}

export async function createFridge(input: CreateFridgeInput): Promise<Fridge> {
  const { data, error } = await supabase
    .from('fridges')
    .insert({ space_id: input.spaceId, name: input.name })
    .select()
    .single()

  if (error) throw error
  return data as Fridge
}

export async function deleteFridge(fridgeId: string): Promise<void> {
  const { error } = await supabase.from('fridges').delete().eq('id', fridgeId)
  if (error) throw error
}

// ─── Memberships ──────────────────────────────────────────────────────────────

export async function getMembersBySpace(spaceId: string): Promise<Membership[]> {
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Membership[]
}

export async function addMember(
  spaceId: string,
  userId: string,
  role: MemberRole = 'member',
): Promise<Membership> {
  const { data, error } = await supabase
    .from('memberships')
    .insert({ space_id: spaceId, user_id: userId, role })
    .select()
    .single()

  if (error) throw error
  return data as Membership
}

export async function updateMemberRole(
  spaceId: string,
  userId: string,
  role: MemberRole,
): Promise<Membership> {
  const { data, error } = await supabase
    .from('memberships')
    .update({ role })
    .eq('space_id', spaceId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Membership
}

export async function removeMember(spaceId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('space_id', spaceId)
    .eq('user_id', userId)
  if (error) throw error
}
