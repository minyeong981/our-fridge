'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = '나눔/공유' | '이의 제기/신고' | '정보/메시지'

const CATEGORIES: Category[] = ['나눔/공유', '이의 제기/신고', '정보/메시지']

const MAX_TITLE_LENGTH = 50
const MAX_CONTENT_LENGTH = 500
const MAX_PHOTOS = 3
const CONTENT_ROWS = 8

const MOCK_POSTS: Record<string, { category: Category; title: string; content: string }> = {
  p1: {
    category: '이의 제기/신고',
    title: '유통기한 임박! 요거트 신고합니다',
    content:
      '냉장고 2층에 있는 요거트 유통기한이 내일까지예요.\n\n주인분 빨리 확인해 주세요! 버리기엔 아깝고... 드실 수 있으면 드세요.',
  },
  p2: {
    category: '나눔/공유',
    title: '냉동 만두 가져가실 분!',
    content: '어제 마트에서 대용량으로 샀는데 혼자 먹기 너무 많아요. 원하시는 분 가져가세요.',
  },
}

function CommunityWriteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')
  const prefill = postId ? MOCK_POSTS[postId] : null

  const [category, setCategory] = useState<Category>(prefill?.category ?? '나눔/공유')
  const [title, setTitle] = useState(prefill?.title ?? '')
  const [content, setContent] = useState(prefill?.content ?? '')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const isEditMode = !!prefill
  const isReport = category === '이의 제기/신고'
  const canSubmit = title.trim().length > 0 && content.trim().length > 0

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>
        <h1 className="font-bold text-base text-neutral-800">
          {isEditMode ? '게시글 수정' : '글 작성'}
        </h1>
        <button
          disabled={!canSubmit}
          onClick={() => {
            if (canSubmit) router.back()
          }}
          className="text-sm font-bold text-primary disabled:text-neutral-300 transition-colors"
        >
          완료
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 pt-5 pb-8 flex flex-col gap-5">
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
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
            placeholder="제목을 입력해 주세요"
            className="w-full text-neutral-800 font-bold text-lg placeholder:text-neutral-300 border-b border-neutral-100 pb-4 outline-none bg-transparent"
          />

          {/* 내용 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
            placeholder="내용을 입력해 주세요"
            rows={CONTENT_ROWS}
            className="w-full text-sm text-neutral-700 placeholder:text-neutral-300 outline-none resize-none bg-transparent leading-relaxed"
          />

          {/* 사진 추가 */}
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold text-neutral-500">
              사진 추가 <span className="text-neutral-400 font-normal">0 / {MAX_PHOTOS}</span>
            </p>
            <div className="flex gap-2">
              {Array.from({ length: MAX_PHOTOS }, (_, i) => i).map((i) => (
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

          {/* 익명 — 이의 제기/신고 전용 */}
          {isReport && (
            <button
              onClick={() => setIsAnonymous((v) => !v)}
              className="flex items-center gap-2 self-start"
            >
              <div
                className={cn(
                  'w-4 h-4 rounded flex items-center justify-center border transition-colors',
                  isAnonymous ? 'bg-primary border-primary' : 'border-neutral-300',
                )}
              >
                {isAnonymous && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l2.5 2.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs font-semibold text-neutral-500">익명으로 작성</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommunityWritePage() {
  return (
    <Suspense>
      <CommunityWriteContent />
    </Suspense>
  )
}
