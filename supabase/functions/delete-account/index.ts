import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('unauthorized', { status: 401 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // JWT로 유저 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (userError || !user) return new Response('unauthorized', { status: 401 })

    const userId = user.id

    // 1. 유저가 속한 냉장고 ID 수집
    const { data: memberships } = await supabase
      .from('memberships')
      .select('fridge_id')
      .eq('user_id', userId)

    const fridgeIds = (memberships ?? []).map((m: any) => m.fridge_id)

    // 2. 멤버십 삭제
    await supabase.from('memberships').delete().eq('user_id', userId)

    // 3. 멤버가 0인 냉장고 삭제 (유저가 유일한 멤버였던 경우)
    if (fridgeIds.length > 0) {
      const { data: remaining } = await supabase
        .from('memberships')
        .select('fridge_id')
        .in('fridge_id', fridgeIds)

      const remainingSet = new Set((remaining ?? []).map((m: any) => m.fridge_id))
      const emptyFridgeIds = fridgeIds.filter((id: string) => !remainingSet.has(id))

      if (emptyFridgeIds.length > 0) {
        await supabase.from('fridges').delete().in('id', emptyFridgeIds)
      }
    }

    // 4. 푸시 토큰 삭제
    await supabase.from('push_tokens').delete().eq('user_id', userId)

    // 5. auth 유저 삭제 (profiles는 cascade로 삭제됨)
    //    posts/comments의 author_id는 orphan으로 남아 "탈퇴한 사용자"로 표시됨
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return new Response('ok', { status: 200 })
  } catch (e) {
    return new Response(String(e), { status: 500 })
  }
})
