'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Heart, MessageCircle, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { type PostCategory, CATEGORY_STYLE } from '@/lib/constants'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { getMyPosts, deletePost } from '@our-fridge/api'
import { timeAgo } from '@our-fridge/shared'
import type { Post } from '@our-fridge/shared'

export default function MyPostsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showDeleteAll, setShowDeleteAll] = useState(false)

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['my-posts'],
    queryFn: getMyPosts,
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setDeleteTargetId(null)
    },
  })

  const { mutate: removeAll } = useMutation({
    mutationFn: async () => {
      await Promise.all(posts.map((p) => deletePost(p.id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setShowDeleteAll(false)
    },
  })

  return (
    <div className="h-full bg-neutral-50 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>
        <h1 className="font-bold text-base text-neutral-800">내 게시글</h1>
        {posts.length > 0 ? (
          <button
            onClick={() => setShowDeleteAll(true)}
            className="text-xs font-semibold text-red-400 px-1"
          >
            전체 삭제
          </button>
        ) : (
          <div className="w-16" />
        )}
      </header>

      {/* 목록 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 pb-16">
            <p className="text-3xl">📝</p>
            <p className="text-sm text-neutral-400">작성한 게시글이 없어요</p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => router.push(`/community/${post.id}`)}
                onDelete={() => setDeleteTargetId(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="게시글을 삭제할까요?"
        description="작성된 댓글도 모두 함께 삭제되며 복구할 수 없어요."
        confirmLabel="삭제하기"
        onConfirm={() => remove(deleteTargetId!)}
        onCancel={() => setDeleteTargetId(null)}
        destructive
      />

      <ConfirmModal
        isOpen={showDeleteAll}
        title="게시글을 모두 삭제할까요?"
        description="작성된 댓글도 모두 함께 삭제되며 복구할 수 없어요."
        confirmLabel="전체 삭제"
        onConfirm={() => removeAll()}
        onCancel={() => setShowDeleteAll(false)}
        destructive
      />
    </div>
  )
}

function PostCard({ post, onClick, onDelete }: { post: Post; onClick: () => void; onDelete: () => void }) {
  return (
    <div
      className="bg-white rounded-2xl border border-neutral-100 px-4 py-4 cursor-pointer active:bg-neutral-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full inline-block', CATEGORY_STYLE[post.category as PostCategory])}>
          {post.category}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-red-400 transition-colors shrink-0 -mr-1 -mt-0.5"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-neutral-800 line-clamp-2 leading-snug">{post.title}</p>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{post.content}</p>
        </div>
        {post.imageUrls[0] && (
          <img src={post.imageUrls[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-50">
        <span className="text-xs text-neutral-400">{timeAgo(post.createdAt)}</span>
        <div className="flex items-center gap-3 ml-auto">
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <Heart size={12} /> {post.likesCount}
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <MessageCircle size={12} /> {post.commentsCount}
          </span>
        </div>
      </div>
    </div>
  )
}
