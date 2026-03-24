'use client'

import { useState } from 'react'
import { ChevronLeft, MoreHorizontal, Snowflake } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const MOCK_ITEM = {
  id: 'i1',
  name: '싱싱한 양상추',
  imageUrl: '/food1.jpg',
  storageType: '냉장',
  addedBy: '김민지',
  startDate: '2024.06.20',
  expiresAt: '2024.06.28',
  daysLeft: 3,
  totalDays: 60,
  memo: '샌드위치용으로 구매함. 빨리 먹지 않으면 시들어 버리니 이번 주말 안에 꼭 드세요.',
}

type ProcessStatus = '다 먹었어요' | '못 찾겠어요' | '버렸어요'

const PROCESS_ACTIONS: { status: ProcessStatus; emoji: string; description: string }[] = [
  { status: '다 먹었어요', emoji: '✅', description: '맛있게 먹었어요' },
  { status: '못 찾겠어요', emoji: '🔍', description: '어디 갔는지 모르겠어요' },
  { status: '버렸어요', emoji: '🗑️', description: '기한이 지나서 버렸어요' },
]

export default function ItemDetailPage() {
  const router = useRouter()
  const { fridgeId, itemId } = useParams<{ fridgeId: string; itemId: string }>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatus | null>(null)

  const { daysLeft, totalDays, imageUrl } = MOCK_ITEM
  const progress = Math.max(0, Math.min(1, daysLeft / totalDays))
  const daysLabel = daysLeft >= 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`
  const isExpired = daysLeft < 0
  const expiryColor =
    isExpired || daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-primary'
  const barColor =
    isExpired || daysLeft <= 3 ? 'bg-red-400' : daysLeft <= 7 ? 'bg-amber-400' : 'bg-primary'

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* 스크롤 전체 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* 이미지 영역 */}
        <div className="relative w-full aspect-square bg-neutral-100 shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={MOCK_ITEM.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-300 text-sm font-medium">사진 없음</span>
            </div>
          )}

          {/* 플로팅 버튼 */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center"
            >
              <ChevronLeft size={20} className="text-neutral-700" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center"
              >
                <MoreHorizontal size={18} className="text-neutral-700" />
              </button>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-20 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden min-w-[140px]">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        router.push(`/fridges/${fridgeId}/add?itemId=${itemId}`)
                      }}
                      className="w-full px-4 py-3.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
                    >
                      편집하기
                    </button>
                    <div className="h-px bg-neutral-100" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        setIsProcessModalOpen(true)
                      }}
                      className="w-full px-4 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                      삭제하기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="bg-white px-5 pb-28">
          {/* 이름 + 보관 방식 + 등록자 */}
          <div className="pt-5 pb-5">
            <h2 className="text-2xl font-extrabold text-neutral-800 tracking-tight mb-2">
              {MOCK_ITEM.name}
            </h2>
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 rounded-lg">
                <Snowflake size={12} className="text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {MOCK_ITEM.storageType} 보관
                </span>
              </div>
              <span className="text-xs text-neutral-400">{MOCK_ITEM.addedBy}님이 등록함</span>
            </div>
          </div>

          <br />

          {/* 소비기한 */}
          <div className="mb-5">
            <div className="mb-3">
              <p className="text-xs font-semibold text-neutral-400 mb-0.5">소비기한</p>
              <span className={cn('text-4xl font-extrabold tracking-tighter', expiryColor)}>
                {daysLabel}
              </span>
              <span className="text-sm text-neutral-400 ml-1.5">
                {isExpired ? '기한 초과' : '남음'}
              </span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', barColor)}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-neutral-400">{MOCK_ITEM.startDate}</span>
              <span className="text-[11px] text-neutral-400">{MOCK_ITEM.expiresAt}</span>
            </div>
          </div>

          {MOCK_ITEM.memo && (
            <>
              <div className="h-px bg-neutral-100 mb-5" />
              <div className="mb-5">
                <p className="text-xs font-semibold text-neutral-400 mb-2">메모</p>
                <p className="text-sm text-neutral-700 leading-relaxed">{MOCK_ITEM.memo}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 처리하기 모달 */}
      {isProcessModalOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsProcessModalOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-24 flex flex-col gap-4">
            <div className="flex justify-center mb-1">
              <div className="w-8 h-1 rounded-full bg-neutral-200" />
            </div>
            <p className="text-base font-extrabold text-neutral-800">어떻게 됐나요?</p>
            <div className="flex flex-col gap-2">
              {PROCESS_ACTIONS.map(({ status, emoji, description }) => (
                <button
                  key={status}
                  onClick={() => setProcessStatus((prev) => (prev === status ? null : status))}
                  className={cn(
                    'flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-left',
                    processStatus === status
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-50 text-neutral-700',
                  )}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-bold">{status}</p>
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        processStatus === status ? 'text-neutral-300' : 'text-neutral-400',
                      )}
                    >
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              disabled={!processStatus}
              onClick={() => {
                router.back()
              }}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-colors disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed bg-red-500 text-white"
            >
              {processStatus ? `${processStatus} 처리하기` : '선택해주세요'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
