'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, PenLine } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { type PostCategory, CATEGORY_STYLE } from '@/lib/constants'
import { getUserFridges, getPosts } from '@our-fridge/api'
import { timeAgo } from '@our-fridge/shared'
import { useAuth } from '@/contexts/AuthContext'
import type { Post } from '@our-fridge/shared'

type TabType = '전체' | '나눔/공유' | '이의 제기/신고'
const TABS: TabType[] = ['전체', '나눔/공유', '이의 제기/신고']

function Avatar({ name, avatarUrl, size = 6 }: { name: string | null; avatarUrl: string | null; size?: number }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl.replace(/^http:\/\//, 'https://')}
        alt={name ?? ''}
        referrerPolicy="no-referrer"
        className={`w-${size} h-${size} rounded-full object-cover shrink-0`}
      />
    )
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-neutral-100 flex items-center justify-center shrink-0`}>
      <span className="text-[10px] font-bold text-neutral-500">{name?.[0] ?? '?'}</span>
    </div>
  )
}

export default function CommunityPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [fridgeFilter, setFridgeFilter] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('전체')

  const { data: fridges = [], isLoading: isFridgesLoading } = useQuery({
    queryKey: ['fridges', user?.id],
    queryFn: () => getUserFridges(user!.id),
    enabled: !!user,
    select: (data) => data.map((f) => ({ id: f.id, name: f.name })),
  })

  // 첫 번째 냉장고를 기본 선택
  const selectedFridgeId = fridgeFilter ?? fridges[0]?.id ?? null
  const hasFridges = !isFridgesLoading && fridges.length > 0

  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts', selectedFridgeId],
    queryFn: () => getPosts(selectedFridgeId!),
    enabled: !!selectedFridgeId,
  })

  const filtered = posts.filter((p) =>
    activeTab === '전체' || p.category === activeTab,
  )

  // 냉장고 없음 — 먼저 만들도록 유도
  if (!authLoading && !isFridgesLoading && fridges.length === 0) {
    return (
      <div className="h-full bg-neutral-50 flex flex-col items-center justify-center gap-6 pb-16 px-8">
        <p className="text-5xl">🧊</p>
        <div className="text-center">
          <p className="text-base font-bold text-neutral-700">아직 냉장고가 없어요</p>
          <p className="text-sm text-neutral-400 mt-1">커뮤니티를 이용하려면 냉장고가 필요해요</p>
        </div>
        <button
          onClick={() => router.push('/fridges')}
          className="px-5 py-3 bg-primary text-white text-sm font-semibold rounded-full"
        >
          냉장고 만들러 가기
        </button>
      </div>
    )
  }

  return (
    <div className="h-full bg-neutral-50 flex flex-col overflow-hidden">
      {/* 냉장고 필터 */}
      <div className="bg-white border-b border-neutral-100 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {fridges.map((f) => (
            <button
              key={f.id}
              onClick={() => setFridgeFilter(f.id)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border',
                selectedFridgeId === f.id
                  ? 'bg-neutral-800 text-white border-neutral-800'
                  : 'bg-white text-neutral-500 border-neutral-200',
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="bg-white border-b border-neutral-100 flex px-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'py-3 px-3 text-sm font-semibold transition-colors relative whitespace-nowrap',
              activeTab === tab ? 'text-neutral-800' : 'text-neutral-400',
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        {isPostsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-16">
            <p className="text-5xl">📭</p>
            <p className="text-base font-semibold text-neutral-500">아직 게시글이 없어요</p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto w-full px-4 py-4 pb-20 flex flex-col gap-3">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => router.push(`/community/${post.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {hasFridges && (
        <button
          onClick={() => selectedFridgeId && router.push(`/community/write?fridgeId=${selectedFridgeId}`)}
          className="fixed bottom-3 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-40"
        >
          <PenLine size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-neutral-100 px-4 py-4 cursor-pointer active:bg-neutral-50 transition-colors"
    >
      <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block', CATEGORY_STYLE[post.category as PostCategory])}>
        {post.category}
      </span>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-neutral-800 line-clamp-2 leading-snug">{post.title}</p>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{post.content}</p>
        </div>
        {post.imageUrls[0] && (
          <img src={post.imageUrls[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-50">
        <Avatar name={post.authorName} avatarUrl={post.authorAvatarUrl} size={5} />
        <span className="text-xs text-neutral-400">{post.authorName ?? '익명'}</span>
        <span className="text-neutral-200 text-xs">·</span>
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
