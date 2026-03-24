'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, SendHorizonal } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = '나눔/공유' | '이의 제기/신고' | '정보/메시지'

const CATEGORIES: Category[] = ['나눔/공유', '이의 제기/신고', '정보/메시지']

const MOCK_POSTS: Record<string, { category: Category; title: string; content: string }> = {
  p1: { category: '이의 제기/신고', title: '유통기한 임박! 요거트 신고합니다', content: '냉장고 2층에 있는 요거트 유통기한이 내일까지예요.\n\n주인분 빨리 확인해 주세요! 버리기엔 아깝고... 드실 수 있으면 드세요.' },
  p2: { category: '나눔/공유', title: '냉동 만두 가져가실 분!', content: '어제 마트에서 대용량으로 샀는데 혼자 먹기 너무 많아요. 원하시는 분 가져가세요.' },
}

export default function CommunityWritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')
  const prefill = postId ? MOCK_POSTS[postId] : null

  const [category, setCategory] = useState<Category>(prefill?.category ?? '나눔/공유')
  const [title, setTitle] = useState(prefill?.title ?? '')
  const [content, setContent] = useState(prefill?.content ?? '')

  const isEditMode = !!prefill
  const canSubmit = title.trim().length > 0 && content.trim().length > 0

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 pt-5 pb-32 flex flex-col gap-5">

          {/* 카테고리 */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border',
                  category === c
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-neutral-500 border-neutral-200',
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* 제목 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 50))}
            placeholder="제목을 입력해 주세요"
            className="w-full text-neutral-800 font-bold text-lg placeholder:text-neutral-300 border-b border-neutral-100 pb-4 outline-none bg-transparent"
          />

          {/* 내용 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            placeholder="내용을 입력해 주세요"
            rows={8}
            className="w-full text-sm text-neutral-700 placeholder:text-neutral-300 outline-none resize-none bg-transparent leading-relaxed"
          />

          {/* 사진 추가 */}
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold text-neutral-500">
              사진 추가 <span className="text-neutral-400 font-normal">0 / 3</span>
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className="w-24 h-24 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center gap-1.5 text-neutral-400"
                >
                  {i === 0 && (
                    <>
                      <Camera size={18} />
                      <span className="text-[10px] font-semibold tracking-wide">ADD PHOTO</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 제출 FAB — 네비게이션 바 위 */}
      <button
        disabled={!canSubmit}
        onClick={() => { if (canSubmit) router.back() }}
        className={cn(
          'fixed bottom-20 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all z-40',
          canSubmit
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'bg-neutral-200 text-neutral-400',
        )}
      >
        <SendHorizonal size={18} />
      </button>
    </div>
  )
}
