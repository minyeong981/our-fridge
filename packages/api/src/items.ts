import type { CreateItemInput, Item, ItemStatus, UpdateItemInput } from '@our-fridge/shared'
import { supabase } from './client'

function mapItem(raw: any): Item {
  return {
    id: raw.id,
    fridgeId: raw.fridge_id,
    name: raw.name,
    storageType: raw.storage_type,
    registeredBy: raw.registered_by,
    expireDate: raw.expire_date ?? null,
    memo: raw.memo ?? null,
    imageUrls: raw.image_urls ?? [],
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export async function getItem(itemId: string): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) throw error
  return mapItem(data)
}

export async function getItemsByFridge(fridgeId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('fridge_id', fridgeId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapItem)
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) throw new Error('로그인이 필요해요')

  const { data, error } = await supabase
    .from('items')
    .insert({
      fridge_id: input.fridgeId,
      name: input.name,
      storage_type: input.storageType ?? '냉장',
      registered_by: userId,
      expire_date: input.expireDate ?? null,
      memo: input.memo ?? null,
      image_urls: input.imageUrls ?? [],
    })
    .select()
    .single()

  if (error) throw error
  return mapItem(data)
}

export async function updateItem(itemId: string, input: UpdateItemInput): Promise<Item> {
  const patch: Record<string, any> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.storageType !== undefined) patch.storage_type = input.storageType
  if (input.expireDate !== undefined) patch.expire_date = input.expireDate
  if (input.memo !== undefined) patch.memo = input.memo
  if (input.imageUrls !== undefined) patch.image_urls = input.imageUrls
  if (input.status !== undefined) patch.status = input.status

  const { data, error } = await supabase
    .from('items')
    .update(patch)
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return mapItem(data)
}

export async function updateItemStatus(itemId: string, status: ItemStatus): Promise<Item> {
  return updateItem(itemId, { status })
}

export async function uploadItemImage(fridgeId: string, base64: string, format: 'webp' | 'jpeg' = 'webp'): Promise<string> {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: `image/${format}` })
  const path = `${fridgeId}/${crypto.randomUUID()}.${format}`

  const { error } = await supabase.storage.from('item-images').upload(path, blob)
  if (error) throw error

  const { data } = supabase.storage.from('item-images').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', itemId)
  if (error) throw error
}
