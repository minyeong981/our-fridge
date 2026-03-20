import type { CreateItemInput, Item, ItemStatus, UpdateItemInput } from '@our-fridge/shared'
import { supabase } from './client'

export async function getItemsByFridge(fridgeId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('fridge_id', fridgeId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Item[]
}

export async function getItemsBySpace(spaceId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*, fridges!inner(space_id)')
    .eq('fridges.space_id', spaceId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Item[]
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert({
      fridge_id: input.fridgeId,
      name: input.name,
      owner_name: input.ownerName,
      is_anonymous: input.isAnonymous,
      expire_date: input.expireDate ?? null,
      memo: input.memo ?? null,
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Item
}

export async function updateItem(itemId: string, input: UpdateItemInput): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.ownerName !== undefined && { owner_name: input.ownerName }),
      ...(input.expireDate !== undefined && { expire_date: input.expireDate }),
      ...(input.memo !== undefined && { memo: input.memo }),
      ...(input.imageUrl !== undefined && { image_url: input.imageUrl }),
      ...(input.status !== undefined && { status: input.status }),
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data as Item
}

export async function updateItemStatus(itemId: string, status: ItemStatus): Promise<Item> {
  return updateItem(itemId, { status })
}

export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', itemId)
  if (error) throw error
}
