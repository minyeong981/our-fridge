import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

Deno.serve(async (req) => {
  try {
    const { postId, commentId, parentId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 댓글 정보 조회
    const { data: comment } = await supabase
      .from('comments')
      .select('author_id, content, is_anonymous')
      .eq('id', commentId)
      .single()

    if (!comment) return new Response('comment not found', { status: 404 })

    // 알림 받을 대상 결정: 답글이면 부모 댓글 작성자, 아니면 게시글 작성자
    let recipientId: string | null = null

    if (parentId) {
      const { data: parent } = await supabase
        .from('comments')
        .select('author_id')
        .eq('id', parentId)
        .single()
      recipientId = parent?.author_id ?? null
    } else {
      const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single()
      recipientId = post?.author_id ?? null
    }

    // 본인 댓글이면 알림 안 보냄
    if (!recipientId || recipientId === comment.author_id) {
      return new Response('skip', { status: 200 })
    }

    // 수신자 푸시 토큰 조회
    const { data: tokenRow } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', recipientId)
      .single()

    if (!tokenRow?.token) return new Response('no token', { status: 200 })

    // 발신자 이름
    let senderName = '누군가'
    if (!comment.is_anonymous) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', comment.author_id)
        .single()
      senderName = profile?.name ?? '누군가'
    }

    const body = `${senderName}님이 ${parentId ? '답글' : '댓글'}을 남겼어요: ${comment.content.slice(0, 40)}`

    // Expo Push API 호출
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: tokenRow.token,
        title: parentId ? '새 답글' : '새 댓글',
        body,
        data: { category: 'comment', url: `/community/${postId}` },
        sound: 'default',
      }),
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), { status: 200 })
  } catch (e) {
    return new Response(String(e), { status: 500 })
  }
})
