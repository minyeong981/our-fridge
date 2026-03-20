import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function initSupabase(url: string, key: string) {
  _client = createClient(url, key)
}

export function getSupabase(): SupabaseClient {
  if (!_client) throw new Error('[api] initSupabase()를 먼저 호출해야 합니다.')
  return _client
}

// 하위 호환성 — API 함수들이 supabase를 직접 import할 때 사용
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  },
})
