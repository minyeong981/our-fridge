'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, MessageCircle, Send, CornerDownRight, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type PostCategory, CATEGORY_STYLE } from '@/lib/constants'
import { ContextMenu } from '@/components/ui/ContextMenu'

interface Reply {
  id: string
  author: string
  initial: string
  color: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
}

interface Comment {
  id: string
  author: string
  initial: string
  color: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  replies: Reply[]
}

const MOCK_POST = {
  id: 'p1',
  category: '이의 제기/신고' as PostCategory,
  title: '유통기한 임박! 요거트 신고합니다',
  content:
    '냉장고 2층에 있는 요거트 유통기한이 내일까지예요.\n\n주인분 빨리 확인해 주세요! 버리기엔 아깝고... 드실 수 있으면 드세요. 🥛',
  author: '김민지',
  initial: '민',
  color: 'bg-primary-100 text-primary-600',
  createdAt: '2026. 3. 23  09:41',
  likes: 12,
  isLiked: false,
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: 'Sarah J.',
    initial: 'S',
    color: 'bg-secondary-100 text-secondary-600',
    content: '제 거예요! 오늘 가져갈게요 감사합니다 😊',
    createdAt: '10분 전',
    likes: 3,
    isLiked: false,
    replies: [
      {
        id: 'r1',
        author: '김민지',
        initial: '민',
        color: 'bg-primary-100 text-primary-600',
        content: '네! 냉장고 2층 왼쪽에 있어요 🙂',
        createdAt: '8분 전',
        likes: 1,
        isLiked: false,
      },
    ],
  },
  {
    id: 'c2',
    author: 'Marcus L.',
    initial: 'M',
    color: 'bg-neutral-100 text-neutral-600',
    content: '아 저도 이런 거 잘 놓치는데... 알림 기능 있으면 좋겠네요',
    createdAt: '5분 전',
    likes: 1,
    isLiked: true,
    replies: [],
  },
]

const ME = { name: '김민지', initial: '민', color: 'bg-primary-100 text-primary-600' }

export default function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [isPostLiked, setIsPostLiked] = useState(MOCK_POST.isLiked)
  const [postLikes, setPostLikes] = useState(MOCK_POST.likes)
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; author: string } | null>(null)
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const totalComments = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  const togglePostLike = () => {
    setIsPostLiked((v) => !v)
    setPostLikes((n) => (isPostLiked ? n - 1 : n + 1))
  }
  const toggleCommentLike = (id: string) =>
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          : c,
      ),
    )
  const toggleReplyLike = (cid: string, rid: string) =>
    setComments((prev) =>
      prev.map((c) =>
        c.id === cid
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r.id === rid
                  ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
                  : r,
              ),
            }
          : c,
      ),
    )
  const deleteComment = (id: string) => setComments((prev) => prev.filter((c) => c.id !== id))
  const deleteReply = (cid: string, rid: string) =>
    setComments((prev) =>
      prev.map((c) =>
        c.id === cid ? { ...c, replies: c.replies.filter((r) => r.id !== rid) } : c,
      ),
    )
  const saveEdit = () => {
    if (!editText.trim() || !editingId) return
    if (editingId.startsWith('c-')) {
      const id = editingId.slice(2)
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, content: editText.trim() } : c)))
    } else if (editingId.startsWith('r-')) {
      const [, cid, rid] = editingId.split('-')
      setComments((prev) =>
        prev.map((c) =>
          c.id === cid
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === rid ? { ...r, content: editText.trim() } : r,
                ),
              }
            : c,
        ),
      )
    }
    setEditingId(null)
    setEditText('')
  }
  const startReply = (commentId: string, author: string) => {
    setReplyingTo({ commentId, author })
    setCommentText('')
    inputRef.current?.focus()
  }
  const submitComment = () => {
    if (!commentText.trim()) return
    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.commentId
            ? {
                ...c,
                replies: [
                  ...c.replies,
                  {
                    id: `r${Date.now()}`,
                    author: ME.name,
                    initial: ME.initial,
                    color: ME.color,
                    content: commentText.trim(),
                    createdAt: '방금 전',
                    likes: 0,
                    isLiked: false,
                  },
                ],
              }
            : c,
        ),
      )
      setReplyingTo(null)
    } else {
      setComments((prev) => [
        ...prev,
        {
          id: `c${Date.now()}`,
          author: ME.name,
          initial: ME.initial,
          color: ME.color,
          content: commentText.trim(),
          createdAt: '방금 전',
          likes: 0,
          isLiked: false,
          replies: [],
        },
      ])
    }
    setCommentText('')
  }

  function EditBox({
    onSave,
    onCancel,
    leftActions,
  }: {
    onSave: () => void
    onCancel: () => void
    leftActions?: React.ReactNode
  }) {
    return (
      <div className="mt-1">
        <textarea
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value.slice(0, 200))}
          rows={2}
          className="w-full text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 outline-none resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>{leftActions}</div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="text-xs text-neutral-400 font-medium">
              취소
            </button>
            <button
              onClick={onSave}
              disabled={!editText.trim()}
              className="text-xs font-bold text-primary disabled:text-neutral-300"
            >
              완료
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* ── 게시글 ── */}
        <div className="px-4 pt-5 pb-4">
          {/* 메타 */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'text-[11px] font-bold px-2 py-0.5 rounded-full',
                CATEGORY_STYLE[MOCK_POST.category],
              )}
            >
              {MOCK_POST.category}
            </span>
            {MOCK_POST.author === ME.name && (
              <div className="ml-auto relative">
                <button
                  onClick={() => setIsPostMenuOpen((v) => !v)}
                  className="p-1 rounded hover:bg-neutral-100 transition-colors"
                >
                  <MoreVertical size={16} className="text-neutral-400" />
                </button>
                {isPostMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsPostMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-50 w-28">
                      <button
                        onClick={() => {
                          setIsPostMenuOpen(false)
                          router.push(`/community/write?postId=${postId}`)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        수정하기
                      </button>
                      <button
                        onClick={() => {
                          setIsPostMenuOpen(false)
                          router.back()
                        }}
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

          {/* 제목 */}
          <h1 className="text-base font-bold text-neutral-900 leading-snug mb-2">
            {MOCK_POST.title}
          </h1>

          {/* 작성자 + 시간 */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                MOCK_POST.color,
              )}
            >
              {MOCK_POST.initial}
            </div>
            <span className="text-xs font-semibold text-neutral-600">{MOCK_POST.author}</span>
            <span className="text-xs text-neutral-400">{MOCK_POST.createdAt}</span>
          </div>

          {/* 내용 */}
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line mb-4">
            {MOCK_POST.content}
          </p>

          {/* 액션 바 */}
          <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
            <button onClick={togglePostLike} className="flex items-center gap-1.5">
              <Heart
                size={16}
                className={cn(
                  'transition-colors',
                  isPostLiked ? 'fill-red-400 text-red-400' : 'text-neutral-400',
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  isPostLiked ? 'text-red-400' : 'text-neutral-500',
                )}
              >
                {postLikes}
              </span>
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
              {/* 댓글 */}
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5',
                    c.color,
                  )}
                >
                  {c.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-neutral-800">{c.author}</span>
                    {c.author === MOCK_POST.author && (
                      <span className="text-[11px] text-neutral-400">(작성자)</span>
                    )}
                    <span className="text-[11px] text-neutral-400">{c.createdAt}</span>
                    {c.author === ME.name && (
                      <div className="ml-auto">
                        <ContextMenu
                          menuId={`c-${c.id}`}
                          openMenuId={openMenuId}
                          onOpenChange={setOpenMenuId}
                          items={[
                            {
                              label: '수정하기',
                              onClick: () => {
                                setEditingId(`c-${c.id}`)
                                setEditText(c.content)
                              },
                            },
                            { label: '삭제하기', onClick: () => deleteComment(c.id), danger: true },
                          ]}
                        />
                      </div>
                    )}
                  </div>

                  {editingId === `c-${c.id}` ? (
                    <EditBox
                      onSave={saveEdit}
                      onCancel={() => {
                        setEditingId(null)
                        setEditText('')
                      }}
                      leftActions={
                        <button
                          onClick={() => toggleCommentLike(c.id)}
                          className="flex items-center gap-1"
                        >
                          <Heart
                            size={12}
                            className={cn(
                              'transition-colors',
                              c.isLiked ? 'fill-red-400 text-red-400' : 'text-neutral-300',
                            )}
                          />
                          <span className={cn('text-[11px]', c.isLiked ? 'text-red-400' : 'text-neutral-400')}>
                            {c.likes}
                          </span>
                        </button>
                      }
                    />
                  ) : (
                    <>
                      <p className="text-sm text-neutral-700 leading-relaxed">{c.content}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          onClick={() => startReply(c.id, c.author)}
                          className="text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          답글 달기
                        </button>
                        <button
                          onClick={() => toggleCommentLike(c.id)}
                          className="flex items-center gap-1"
                        >
                          <Heart
                            size={12}
                            className={cn(
                              'transition-colors',
                              c.isLiked ? 'fill-red-400 text-red-400' : 'text-neutral-300',
                            )}
                          />
                          <span className={cn('text-[11px]', c.isLiked ? 'text-red-400' : 'text-neutral-400')}>
                            {c.likes}
                          </span>
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
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                      r.color,
                    )}
                  >
                    {r.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-bold text-neutral-800">{r.author}</span>
                      {r.author === MOCK_POST.author && (
                        <span className="text-[11px] text-neutral-400">(작성자)</span>
                      )}
                      <span className="text-[11px] text-neutral-400">{r.createdAt}</span>
                      {r.author === ME.name && (
                        <div className="ml-auto">
                          <ContextMenu
                            menuId={`r-${c.id}-${r.id}`}
                            openMenuId={openMenuId}
                            onOpenChange={setOpenMenuId}
                            items={[
                              {
                                label: '수정하기',
                                onClick: () => {
                                  setEditingId(`r-${c.id}-${r.id}`)
                                  setEditText(r.content)
                                },
                              },
                              {
                                label: '삭제하기',
                                onClick: () => deleteReply(c.id, r.id),
                                danger: true,
                              },
                            ]}
                          />
                        </div>
                      )}
                    </div>

                    {editingId === `r-${c.id}-${r.id}` ? (
                      <EditBox
                        onSave={saveEdit}
                        onCancel={() => {
                          setEditingId(null)
                          setEditText('')
                        }}
                        leftActions={
                          <button
                            onClick={() => toggleReplyLike(c.id, r.id)}
                            className="flex items-center gap-1"
                          >
                            <Heart
                              size={12}
                              className={cn(
                                'transition-colors',
                                r.isLiked ? 'fill-red-400 text-red-400' : 'text-neutral-300',
                              )}
                            />
                            <span className={cn('text-[11px]', r.isLiked ? 'text-red-400' : 'text-neutral-400')}>
                              {r.likes}
                            </span>
                          </button>
                        }
                      />
                    ) : (
                      <>
                        <p className="text-sm text-neutral-700 leading-relaxed">{r.content}</p>
                        <button
                          onClick={() => toggleReplyLike(c.id, r.id)}
                          className="flex items-center gap-1 mt-1.5"
                        >
                          <Heart
                            size={12}
                            className={cn(
                              'transition-colors',
                              r.isLiked ? 'fill-red-400 text-red-400' : 'text-neutral-300',
                            )}
                          />
                          <span className={cn('text-[11px]', r.isLiked ? 'text-red-400' : 'text-neutral-400')}>
                            {r.likes}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="h-36" />
      </div>

      {/* 댓글 입력창 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-neutral-100 z-40">
        {replyingTo && (
          <div className="flex items-center justify-between px-4 pt-2 pb-1">
            <span className="text-xs text-neutral-500">
              <span className="font-semibold text-primary">{replyingTo.author}</span>에게 답글 달기
            </span>
            <button
              onClick={() => {
                setReplyingTo(null)
                setCommentText('')
              }}
              className="text-xs text-neutral-400"
            >
              취소
            </button>
          </div>
        )}
        <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value.slice(0, 200))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitComment()
            }}
            placeholder={replyingTo ? '답글을 입력하세요' : '댓글을 입력하세요'}
            className="flex-1 bg-neutral-100 rounded-full px-4 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
          />
          <button
            onClick={submitComment}
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
    </div>
  )
}
