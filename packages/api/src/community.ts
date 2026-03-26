import type {
  Post,
  Comment,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
} from '@our-fridge/shared'
import { supabase } from './client'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapPost(raw: any, profileMap: Record<string, any>, likedIds: Set<string>): Post {
  const profile = profileMap[raw.author_id]
  return {
    id: raw.id,
    fridgeId: raw.fridge_id,
    authorId: raw.author_id,
    authorName: raw.is_anonymous ? '익명' : (profile?.name ?? null),
    authorAvatarUrl: raw.is_anonymous ? null : (profile?.avatar_url ?? null),
    isAnonymous: raw.is_anonymous,
    category: raw.category,
    title: raw.title,
    content: raw.content,
    imageUrls: raw.image_urls ?? [],
    likesCount: raw.likes_count ?? 0,
    commentsCount: raw.comments_count ?? 0,
    isLiked: likedIds.has(raw.id),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

function mapComment(
  raw: any,
  profileMap: Record<string, any>,
  likedIds: Set<string>,
  replies: Comment[] = [],
): Comment {
  const profile = profileMap[raw.author_id]
  return {
    id: raw.id,
    postId: raw.post_id,
    authorId: raw.author_id,
    authorName: raw.is_anonymous ? '익명' : (profile?.name ?? null),
    authorAvatarUrl: raw.is_anonymous ? null : (profile?.avatar_url ?? null),
    isAnonymous: raw.is_anonymous,
    parentId: raw.parent_id ?? null,
    content: raw.content,
    likesCount: raw.likes_count ?? 0,
    isLiked: likedIds.has(raw.id),
    replies,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

async function fetchProfiles(userIds: string[]): Promise<Record<string, any>> {
  if (userIds.length === 0) return {}
  const { data } = await supabase.from('profiles').select('id, name, avatar_url').in('id', userIds)
  return Object.fromEntries((data ?? []).map((p: any) => [p.id, p]))
}

async function fetchLikedPostIds(postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Set()
  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .in('post_id', postIds)
    .eq('user_id', user.id)
  return new Set((data ?? []).map((r: any) => r.post_id))
}

async function fetchLikedCommentIds(commentIds: string[]): Promise<Set<string>> {
  if (commentIds.length === 0) return new Set()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Set()
  const { data } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .in('comment_id', commentIds)
    .eq('user_id', user.id)
  return new Set((data ?? []).map((r: any) => r.comment_id))
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(fridgeId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('fridge_id', fridgeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!data || data.length === 0) return []

  const authorIds = [...new Set(data.map((p: any) => p.author_id))]
  const [profileMap, likedIds] = await Promise.all([
    fetchProfiles(authorIds),
    fetchLikedPostIds(data.map((p: any) => p.id)),
  ])
  return data.map((p: any) => mapPost(p, profileMap, likedIds))
}

export async function getPost(postId: string): Promise<Post> {
  const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single()
  if (error) throw error

  const [profileMap, likedIds] = await Promise.all([
    fetchProfiles([data.author_id]),
    fetchLikedPostIds([postId]),
  ])
  return mapPost(data, profileMap, likedIds)
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthenticated')

  const { data, error } = await supabase
    .from('posts')
    .insert({
      fridge_id: input.fridgeId,
      author_id: user.id,
      category: input.category,
      title: input.title,
      content: input.content,
      is_anonymous: input.isAnonymous ?? false,
      image_urls: input.imageUrls ?? [],
    })
    .select()
    .single()
  if (error) throw error

  const [profileMap, likedIds] = await Promise.all([
    fetchProfiles([user.id]),
    fetchLikedPostIds([data.id]),
  ])
  return mapPost(data, profileMap, likedIds)
}

export async function updatePost(postId: string, input: UpdatePostInput): Promise<void> {
  const patch: Record<string, any> = {}
  if (input.category !== undefined) patch.category = input.category
  if (input.title !== undefined) patch.title = input.title
  if (input.content !== undefined) patch.content = input.content
  if (input.isAnonymous !== undefined) patch.is_anonymous = input.isAnonymous
  if (input.imageUrls !== undefined) patch.image_urls = input.imageUrls
  patch.updated_at = new Date().toISOString()

  const { error } = await supabase.from('posts').update(patch).eq('id', postId)
  if (error) throw error
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}

export async function togglePostLike(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthenticated')

  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    return false
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    return true
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw error
  if (!data || data.length === 0) return []

  const authorIds = [...new Set(data.map((c: any) => c.author_id))]
  const allIds = data.map((c: any) => c.id)
  const [profileMap, likedIds] = await Promise.all([
    fetchProfiles(authorIds),
    fetchLikedCommentIds(allIds),
  ])

  const replyMap: Record<string, Comment[]> = {}
  const topLevel: Comment[] = []

  for (const raw of data) {
    if (raw.parent_id) {
      if (!replyMap[raw.parent_id]) replyMap[raw.parent_id] = []
      replyMap[raw.parent_id].push(mapComment(raw, profileMap, likedIds))
    }
  }
  for (const raw of data) {
    if (!raw.parent_id) {
      topLevel.push(mapComment(raw, profileMap, likedIds, replyMap[raw.id] ?? []))
    }
  }
  return topLevel
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthenticated')

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: input.postId,
      author_id: user.id,
      parent_id: input.parentId ?? null,
      content: input.content,
      is_anonymous: input.isAnonymous ?? false,
    })
    .select()
    .single()
  if (error) throw error

  const profileMap = await fetchProfiles([user.id])
  return mapComment(data, profileMap, new Set())
}

export async function updateComment(commentId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
  if (error) throw error
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) throw error
}

export async function toggleCommentLike(commentId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthenticated')

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id)
    return false
  } else {
    await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
    return true
  }
}

export async function getMyPosts(): Promise<Post[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!data || data.length === 0) return []

  const profileMap = await fetchProfiles([user.id])
  const likedIds = await fetchLikedPostIds(data.map((p: any) => p.id))
  return data.map((p: any) => mapPost(p, profileMap, likedIds))
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function uploadPostImage(base64: string, ext: string = 'webp'): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthenticated')

  const mime = ext === 'webp' ? 'image/webp' : 'image/jpeg'
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: mime })
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('post-images').upload(path, blob)
  if (error) throw error

  const { data } = supabase.storage.from('post-images').getPublicUrl(path)
  return data.publicUrl
}
