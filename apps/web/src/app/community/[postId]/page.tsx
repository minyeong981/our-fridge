'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, MessageCircle, Send, CornerDownRight, MoreVertical, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { type PostCategory, CATEGORY_STYLE } from '@/lib/constants'
import { ContextMenu } from '@/components/ui/ContextMenu'
import {
  getPost,
  getComments,
  deletePost,
  togglePostLike,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from '@our-fridge/api'
import { timeAgo } from '@our-fridge/shared'
import { useAuth } from '@/contexts/AuthContext'
import type { Comment } from '@our-fridge/shared'

const MAX_COMMENT_LENGTH = 200

function Avatar({ name, avatarUrl, size = 7 }: { name: string | null; avatarUrl: string | null; size?: number }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl.replace(/^http:\/\//, 'https://')}
        alt={name ?? ''}
        referrerPolicy="no-referrer"
        className={`w-${size} h-${size} rounded-full object-cover shrink-0 mt-0.5`}
      />
    )
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5`}>
      <span className="text-[11px] font-bold text-neutral-500">{name?.[0] ?? '?'}</span>
    </div>
  )
}

export default function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const touchStartX = useRef(0)
  const { user } = useAuth()

  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; author: string } | null>(null)
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)

  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
  })

  const totalComments = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  const { mutate: likePost } = useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      const prev = queryClient.getQueryData(['post', postId]) as typeof post
      queryClient.setQueryData(['post', postId], (old: any) =>
        old ? { ...old, isLiked: !old.isLiked, likesCount: old.isLiked ? old.likesCount - 1 : old.likesCount + 1 } : old
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['post', postId], ctx?.prev),
  })

  const { mutate: removePost } = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      router.back()
    },
  })

  const { mutate: submitComment } = useMutation({
    mutationFn: () =>
      createComment({
        postId,
        content: commentText.trim(),
        parentId: replyingTo?.commentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      setCommentText('')
      setReplyingTo(null)
    },
  })

  const { mutate: saveEdit } = useMutation({
    mutationFn: (commentId: string) => updateComment(commentId, editText.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      setEditingId(null)
      setEditText('')
    },
  })

  const { mutate: removeComment } = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })

  const { mutate: likeComment } = useMutation({
    mutationFn: (commentId: string) => toggleCommentLike(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] })
      const prev = queryClient.getQueryData(['comments', postId])
      queryClient.setQueryData(['comments', postId], (old: Comment[] | undefined) =>
        old ? toggleLikeInTree(old, commentId) : old
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['comments', postId], ctx?.prev),
  })

  const startReply = (commentId: string, author: string) => {
    setReplyingTo({ commentId, author })
    setCommentText('')
    inputRef.current?.focus()
  }

  if (isPostLoading || !post) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const isMyPost = user?.id === post.authorId

  function EditBox({ commentId, onCancel }: { commentId: string; onCancel: () => void }) {
    return (
      <div className="mt-1">
        <textarea
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
          rows={2}
          className="w-full text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 outline-none resize-none leading-relaxed"
        />
        <div className="flex justify-end gap-3 mt-1.5">
          <button onClick={onCancel} className="text-xs text-neutral-400 font-medium">취소</button>
          <button
            onClick={() => saveEdit(commentId)}
            disabled={!editText.trim()}
            className="text-xs font-bold text-primary disabled:text-neutral-300"
          >
            완료
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* ── 게시글 ── */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', CATEGORY_STYLE[post.category as PostCategory])}>
              {post.category}
            </span>
            {isMyPost && (
              <div className="ml-auto relative">
                <button onClick={() => setIsPostMenuOpen((v) => !v)} className="p-1">
                  <MoreVertical size={16} className="text-neutral-400" />
                </button>
                {isPostMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsPostMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-50 w-28">
                      <button
                        onClick={() => { setIsPostMenuOpen(false); router.push(`/community/write?postId=${postId}`) }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        수정하기
                      </button>
                      <button
                        onClick={() => { setIsPostMenuOpen(false); removePost() }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                      >
                        삭제하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <h1 className="text-base font-bold text-neutral-900 leading-snug mb-2">{post.title}</h1>

          <div className="flex items-center gap-2 mb-3">
            <Avatar name={post.authorName} avatarUrl={post.authorAvatarUrl} size={6} />
            <span className="text-xs font-semibold text-neutral-600">{post.authorName ?? '익명'}</span>
            <span className="text-xs text-neutral-400">{timeAgo(post.createdAt)}</span>
          </div>

          {/* 이미지 캐러셀 — 본문 위 */}
          {post.imageUrls.length > 0 && (
            <div className="mb-3 -mx-4">
              <div
                className="relative w-full aspect-square bg-neutral-100"
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
                onTouchEnd={(e) => {
                  const dx = e.changedTouches[0].clientX - touchStartX.current
                  if (Math.abs(dx) < 40) return
                  if (dx < 0 && carouselIndex < post.imageUrls.length - 1) setCarouselIndex((i) => i + 1)
                  if (dx > 0 && carouselIndex > 0) setCarouselIndex((i) => i - 1)
                }}
              >
                <img
                  src={post.imageUrls[carouselIndex]}
                  alt=""
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setLightboxIndex(carouselIndex)}
                />
                {/* 좌우 탭 영역 */}
                {carouselIndex > 0 && (
                  <button
                    onClick={() => setCarouselIndex((i) => i - 1)}
                    className="absolute left-0 top-0 h-full w-1/3"
                    aria-label="이전"
                  />
                )}
                {carouselIndex < post.imageUrls.length - 1 && (
                  <button
                    onClick={() => setCarouselIndex((i) => i + 1)}
                    className="absolute right-0 top-0 h-full w-1/3"
                    aria-label="다음"
                  />
                )}
                {/* 인디케이터 */}
                {post.imageUrls.length > 1 && (
                  <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5">
                    {post.imageUrls.map((_, i) => (
                      <div
                        key={i}
                        className={cn('w-1.5 h-1.5 rounded-full transition-colors', i === carouselIndex ? 'bg-white' : 'bg-white/40')}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line mb-4">{post.content}</p>

          <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
            <button onClick={() => likePost()} className="flex items-center gap-1.5">
              <Heart size={16} className={cn('transition-colors', post.isLiked ? 'fill-red-400 text-red-400' : 'text-neutral-400')} />
              <span className={cn('text-sm font-medium', post.isLiked ? 'text-red-400' : 'text-neutral-500')}>{post.likesCount}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <MessageCircle size={16} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-500">{totalComments}</span>
            </div>
          </div>
        </div>

        {/* ── 댓글 ── */}
        <div className="border-t-8 border-neutral-50">
          <div className="px-4 py-3 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-500">댓글 {totalComments}</span>
          </div>

          {comments.map((c, ci) => (
            <div
              key={c.id}
              className={cn(
                'px-4 py-3 transition-colors',
                ci < comments.length - 1 && 'border-b border-neutral-50',
                replyingTo?.commentId === c.id && 'bg-primary-50',
              )}
            >
              <div className="flex items-start gap-2.5">
                <Avatar name={c.authorName} avatarUrl={c.authorAvatarUrl} size={7} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-neutral-800">{c.authorName ?? '익명'}</span>
                    {c.authorId === post.authorId && (
                      <span className="text-[11px] text-neutral-400">(작성자)</span>
                    )}
                    <span className="text-[11px] text-neutral-400">{timeAgo(c.createdAt)}</span>
                    {user?.id === c.authorId && (
                      <div className="ml-auto">
                        <ContextMenu
                          menuId={`c-${c.id}`}
                          openMenuId={openMenuId}
                          onOpenChange={setOpenMenuId}
                          items={[
                            { label: '수정하기', onClick: () => { setEditingId(`c-${c.id}`); setEditText(c.content) } },
                            { label: '삭제하기', onClick: () => removeComment(c.id), danger: true },
                          ]}
                        />
                      </div>
                    )}
                  </div>

                  {editingId === `c-${c.id}` ? (
                    <EditBox commentId={c.id} onCancel={() => { setEditingId(null); setEditText('') }} />
                  ) : (
                    <>
                      <p className="text-sm text-neutral-700 leading-relaxed">{c.content}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button onClick={() => startReply(c.id, c.authorName ?? '익명')} className="text-[11px] text-neutral-400">
                          답글 달기
                        </button>
                        <button onClick={() => likeComment(c.id)} className="flex items-center gap-1">
                          <Heart size={12} className={cn('transition-colors', c.isLiked ? 'fill-red-400 text-red-400' : 'text-neutral-300')} />
                          <span className={cn('text-[11px]', c.isLiked ? 'text-red-400' : 'text-neutral-400')}>{c.likesCount}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 대댓글 */}
              {c.replies.map((r) => (
                <div key={r.id} className="flex items-start gap-2 mt-3 pl-9">
                  <CornerDownRight size={12} className="text-neutral-300 mt-1 shrink-0" />
                  <Avatar name={r.authorName} avatarUrl={r.authorAvatarUrl} size={6} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-bold text-neutral-800">{r.authorName ?? '익명'}</span>
                      {r.authorId === post.authorId && (
                        <span className="text-[11px] text-neutral-400">(작성자)</span>
                      )}
                      <span className="text-[11px] text-neutral-400">{timeAgo(r.createdAt)}</span>
                      {user?.id === r.authorId && (
                        <div className="ml-auto">
                          <ContextMenu
                            menuId={`r-${c.id}-${r.id}`}
                            openMenuId={openMenuId}
                            onOpenChange={setOpenMenuId}
                            items={[
                              { label: '수정하기', onClick: () => { setEditingId(`r-${r.id}`); setEditText(r.content) } },
                              { label: '삭제하기', onClick: () => removeComment(r.id), danger: true },
                            ]}
                          />
                        </div>
                      )}
                    </div>

                    {editingId === `r-${r.id}` ? (
                      <EditBox commentId={r.id} onCancel={() => { setEditingId(null); setEditText('') }} />
                    ) : (
                      <>
                        <p className="text-sm text-neutral-700 leading-relaxed">{r.content}</p>
                        <button onClick={() => likeComment(r.id)} className="flex items-center gap-1 mt-1.5">
                          <Heart size={12} className={cn('transition-colors', r.isLiked ? 'fill-red-400 text-red-400' : 'text-neutral-300')} />
                          <span className={cn('text-[11px]', r.isLiked ? 'text-red-400' : 'text-neutral-400')}>{r.likesCount}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="h-20" />
      </div>

      {/* 댓글 입력창 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 z-40 pb-safe">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-end gap-2">
          <div className="flex-1 min-w-0">
            {replyingTo && (
              <div className="flex items-center gap-1 mb-1 px-1">
                <CornerDownRight size={10} className="text-primary shrink-0" />
                <span className="text-xs text-neutral-500">
                  <span className="font-semibold text-primary">{replyingTo.author}</span>에게 답글 달기
                </span>
                <button onClick={() => { setReplyingTo(null); setCommentText('') }} className="ml-1 text-neutral-400">
                  <X size={12} />
                </button>
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
              onKeyDown={(e) => { if (e.key === 'Enter' && commentText.trim()) submitComment() }}
              placeholder={replyingTo ? '답글을 입력하세요' : '댓글을 입력하세요'}
              className="w-full bg-neutral-100 rounded-full px-4 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
            />
          </div>
          <button
            onClick={() => { if (commentText.trim()) submitComment() }}
            disabled={!commentText.trim()}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0',
              commentText.trim() ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-300',
            )}
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* 이미지 라이트박스 */}
      {lightboxIndex !== null && post && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* 닫기 */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X size={18} />
          </button>

          {/* 이전 */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
              className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <img
            src={post.imageUrls[lightboxIndex]}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 다음 */}
          {lightboxIndex < post.imageUrls.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
              className="absolute right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* 페이지 인디케이터 */}
          {post.imageUrls.length > 1 && (
            <div className="absolute bottom-8 flex gap-1.5">
              {post.imageUrls.map((_, i) => (
                <div
                  key={i}
                  className={cn('w-1.5 h-1.5 rounded-full transition-colors', i === lightboxIndex ? 'bg-white' : 'bg-white/30')}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 낙관적 업데이트용: 댓글 트리에서 좋아요 토글
function toggleLikeInTree(comments: Comment[], targetId: string): Comment[] {
  return comments.map((c) => {
    if (c.id === targetId) {
      return { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 }
    }
    if (c.replies.length > 0) {
      return { ...c, replies: toggleLikeInTree(c.replies, targetId) }
    }
    return c
  })
}
