import type { CreateItemLogInput, ItemLog } from '@our-fridge/shared'
import { supabase } from './client'

export async function getItemLogs(itemId: string): Promise<ItemLog[]> {
  const { data, error } = await supabase
    .from('item_logs')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ItemLog[]
}

export async function createItemLog(input: CreateItemLogInput): Promise<ItemLog> {
  const { data, error } = await supabase
    .from('item_logs')
    .insert({
      item_id: input.itemId,
      action: input.action,
      note: input.note ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as ItemLog
}
