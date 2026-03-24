'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type PostCategory, CATEGORY_STYLE } from '@/lib/constants'

type TabType = '전체' | '나눔/공유' | '이의 제기/신고'

interface Post {
  id: string
  fridgeId: string
  category: PostCategory
  title: string
  content: string
  author: string
  createdAt: string
  likes: number
  comments: number
  imageUrl?: string
}


const MOCK_FRIDGES = [
  { id: '1', name: '우리집 냉장고' },
  { id: '2', name: '사무실 냉장고' },
  { id: '3', name: '여름 별장 펜트리' },
]

const MOCK_POSTS: Post[] = [
  {
    id: 'p1', fridgeId: '1', category: '이의 제기/신고',
    title: '유통기한 임박! 요거트 신고합니다',
    content: '냉장고 2층에 있는 요거트 유통기한이 내일까지예요. 주인분 빨리 확인해 주세요!',
    author: '김민지', createdAt: '방금 전', likes: 12, comments: 3,
    imageUrl: '/food1.jpg',
  },
  {
    id: 'p2', fridgeId: '2', category: '나눔/공유',
    title: '냉동 만두 가져가실 분!',
    content: '어제 마트에서 대용량으로 샀는데 혼자 먹기 너무 많아요. 원하시는 분 가져가세요.',
    author: 'Sarah J.', createdAt: '1시간 전', likes: 5, comments: 2,
  },
  {
    id: 'p3', fridgeId: '1', category: '정보/메시지',
    title: '이번 주 냉장고 청소 공지',
    content: '이번 주 토요일 오후 2시에 냉장고 청소합니다. 본인 음식 미리 확인해 주세요.',
    author: 'Marcus L.', createdAt: '3시간 전', likes: 8, comments: 1,
  },
  {
    id: 'p4', fridgeId: '3', category: '이의 제기/신고',
    title: '제 요거트 없어졌어요',
    content: '어제 넣어둔 딸기 요거트가 사라졌습니다. 혹시 실수로 드셨다면 말씀해 주세요.',
    author: '이준호', createdAt: '어제', likes: 3, comments: 5,
    imageUrl: '/food2.jpg',
  },
  {
    id: 'p5', fridgeId: '2', category: '나눔/공유',
    title: '사과 3개 나눔합니다',
    content: '많이 사서 나눔해요. 1층 냉장고 채소칸에 있습니다.',
    author: '김민지', createdAt: '어제', likes: 4, comments: 0,
  },
]

const TABS: TabType[] = ['전체', '나눔/공유', '이의 제기/신고']

export default function CommunityPage() {
  const router = useRouter()
  const [fridgeFilter, setFridgeFilter] = useState(MOCK_FRIDGES[0].id)
  const [activeTab, setActiveTab] = useState<TabType>('전체')

  const filtered = MOCK_POSTS.filter((p) => {
    const matchFridge = fridgeFilter === 'all' || p.fridgeId === fridgeFilter
    const matchTab = activeTab === '전체' || p.category === activeTab
    return matchFridge && matchTab
  })


  return (
    <div className="h-full bg-neutral-50 flex flex-col overflow-hidden">
      {/* 냉장고 필터 */}
      <div className="bg-white border-b border-neutral-100 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {MOCK_FRIDGES.map((f) => (
            <button
              key={f.id}
              onClick={() => setFridgeFilter(f.id)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border',
                fridgeFilter === f.id
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
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 pb-16">
            <p className="text-3xl">📭</p>
            <p className="text-sm text-neutral-400">아직 게시글이 없어요</p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto w-full px-4 py-4 pb-24 flex flex-col gap-3">
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

      <button
        onClick={() => router.push('/community/write')}
        className="fixed bottom-20 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-40"
      >
        <PenLine size={18} strokeWidth={2.5} />
      </button>
    </div>
  )
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const fridgeName = MOCK_FRIDGES.find((f) => f.id === post.fridgeId)?.name

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-neutral-100 px-4 py-4 cursor-pointer active:bg-neutral-50 transition-colors"
    >
      <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block', CATEGORY_STYLE[post.category])}>
        {post.category}
      </span>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-neutral-800 line-clamp-2 leading-snug">{post.title}</p>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{post.content}</p>
        </div>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-50">
        <span className="text-xs text-neutral-400">{post.author}</span>
        <span className="text-neutral-200 text-xs">·</span>
        <span className="text-xs text-neutral-400">{post.createdAt}</span>
        <div className="flex items-center gap-3 ml-auto">
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <Heart size={12} /> {post.likes}
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <MessageCircle size={12} /> {post.comments}
          </span>
        </div>
      </div>
    </div>
  )
}
