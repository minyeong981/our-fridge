'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, MoreVertical, Snowflake } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { getItem, updateItem, deleteItem, createItemLog, getProfile } from '@our-fridge/api'
import type { ItemLogAction, ItemStatus } from '@our-fridge/shared'

const DAYS_CRITICAL = 3
const DAYS_WARNING = 7

type ProcessStatus = '다 먹었어요' | '못 찾겠어요' | '버렸어요'

const PROCESS_ACTIONS: {
  status: ProcessStatus
  emoji: string
  description: string
  itemStatus: ItemStatus
  logAction: ItemLogAction
}[] = [
  {
    status: '다 먹었어요',
    emoji: '✅',
    description: '맛있게 먹었어요',
    itemStatus: 'consumed',
    logAction: 'consume',
  },
  {
    status: '못 찾겠어요',
    emoji: '🔍',
    description: '어디 갔는지 모르겠어요',
    itemStatus: 'discarded',
    logAction: 'lost',
  },
  {
    status: '버렸어요',
    emoji: '🗑️',
    description: '기한이 지나서 버렸어요',
    itemStatus: 'discarded',
    logAction: 'discard',
  },
]

export default function ItemDetailPage() {
  const router = useRouter()
  const { fridgeId, itemId } = useParams<{ fridgeId: string; itemId: string }>()
  const queryClient = useQueryClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const touchStartX = useRef(0)
  const [processStatus, setProcessStatus] = useState<ProcessStatus | null>(null)

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
    enabled: !!itemId,
  })

  const { data: registeredByProfile } = useQuery({
    queryKey: ['profile', item?.registeredBy],
    queryFn: () => getProfile(item?.registeredBy ?? ''),
    enabled: !!item?.registeredBy,
  })

  const { mutate: processItem, isPending: isProcessing } = useMutation({
    mutationFn: async (selected: ProcessStatus) => {
      const action = PROCESS_ACTIONS.find((a) => a.status === selected)!
      await updateItem(itemId, { status: action.itemStatus })
      await createItemLog({ itemId, action: action.logAction })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', fridgeId] })
      router.back()
    },
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: () => deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', fridgeId] })
      router.back()
    },
  })

  if (isLoading || !item) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const startDate = new Date(item.createdAt)
  const expireDate = item.expireDate ? new Date(item.expireDate) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysLeft = expireDate
    ? Math.floor((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const totalDays = expireDate
    ? Math.floor((expireDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const isExpired = daysLeft !== null && daysLeft < 0
  const isCritical = daysLeft !== null && daysLeft <= DAYS_CRITICAL
  const isWarning = daysLeft !== null && daysLeft <= DAYS_WARNING

  // 경과 비율 — totalDays가 0 이하여도 만료면 꽉 찬 바 표시
  const progress =
    daysLeft !== null
      ? totalDays && totalDays > 0
        ? Math.min(1, (totalDays - daysLeft) / totalDays)
        : isExpired
          ? 1
          : 0
      : null

  const daysLabel =
    daysLeft === null ? null : daysLeft >= 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`
  const expiryColor =
    isExpired || isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-primary'
  const barColor =
    isExpired || isCritical ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-primary'

  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="relative w-full h-56 bg-neutral-100 shrink-0">
          {item.imageUrls.length > 0 ? (
            <>
              <img
                src={item.imageUrls[carouselIndex]}
                alt={item.name}
                className="w-full h-full object-cover"
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
                onTouchEnd={(e) => {
                  const dx = e.changedTouches[0].clientX - touchStartX.current
                  if (Math.abs(dx) < 40) return
                  if (dx < 0 && carouselIndex < item.imageUrls.length - 1) setCarouselIndex((i) => i + 1)
                  if (dx > 0 && carouselIndex > 0) setCarouselIndex((i) => i - 1)
                }}
              />
              {carouselIndex > 0 && (
                <button onClick={() => setCarouselIndex((i) => i - 1)} className="absolute left-0 top-0 h-full w-1/3" aria-label="이전" />
              )}
              {carouselIndex < item.imageUrls.length - 1 && (
                <button onClick={() => setCarouselIndex((i) => i + 1)} className="absolute right-0 top-0 h-full w-1/3" aria-label="다음" />
              )}
              {item.imageUrls.length > 1 && (
                <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5">
                  {item.imageUrls.map((_, i) => (
                    <div key={i} className={cn('w-1.5 h-1.5 rounded-full transition-colors', i === carouselIndex ? 'bg-white' : 'bg-white/40')} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-300 text-sm font-medium">사진 없음</span>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center"
            >
              <ChevronLeft size={26} className="text-white" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className="w-10 h-10 flex items-center justify-center"
              >
                <MoreVertical size={22} className="text-white" />
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
                        setIsDeleteConfirmOpen(true)
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
        <div className="bg-white px-5 flex flex-col gap-8 pt-6 pb-20">
          {/* 이름 + 보관 방식 */}
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-800 tracking-tight mb-3">
              {item.name}
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 rounded-lg">
                <Snowflake size={12} className="text-primary" />
                <span className="text-xs font-semibold text-primary">{item.storageType} 보관</span>
              </div>
              {registeredByProfile?.name && (
                <span className="text-xs text-neutral-400">
                  {registeredByProfile.name}님이 등록함
                </span>
              )}
            </div>
          </div>

          {/* 소비기한 */}
          {daysLabel !== null && expireDate && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 mb-3">소비기한</p>
              <div className="mb-5">
                <span className={cn('text-3xl font-extrabold tracking-tighter', expiryColor)}>
                  {daysLabel}
                </span>
                <span className="text-sm text-neutral-400 ml-3">
                  {isExpired ? '기한 초과' : '남음'}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', barColor)}
                  style={{ width: `${(progress ?? 0) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2.5">
                <span className="text-[11px] text-neutral-400">{fmt(startDate)}</span>
                <span className="text-[11px] text-neutral-400">{fmt(expireDate)}</span>
              </div>
            </div>
          )}

          {/* 메모 */}
          {item.memo && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 mb-3">메모</p>
              <p className="text-sm text-neutral-700 leading-relaxed">{item.memo}</p>
            </div>
          )}

          {/* 처리하기 버튼 */}
          <button
            onClick={() => setIsProcessModalOpen(true)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm"
          >
            처리하기
          </button>
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
              disabled={!processStatus || isProcessing}
              onClick={() => {
                if (processStatus) processItem(processStatus)
              }}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-colors disabled:bg-neutral-200 disabled:text-neutral-400 bg-red-500 text-white"
            >
              {isProcessing
                ? '처리 중...'
                : processStatus
                  ? `${processStatus} 처리하기`
                  : '선택해주세요'}
            </button>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteConfirmOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          <div className="relative bg-white rounded-3xl px-6 py-6 w-full max-w-sm flex flex-col gap-4">
            <div>
              <p className="text-base font-extrabold text-neutral-800 mb-1">정말 삭제할까요?</p>
              <p className="text-sm text-neutral-500">삭제한 음식은 되돌릴 수 없어요.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-neutral-100 text-sm font-semibold text-neutral-600"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  handleDelete()
                }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-sm font-semibold text-white"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
