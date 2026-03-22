'use client'

import { useState, useEffect } from 'react'
import { Plus, ChevronDown, Megaphone, BookOpen } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Member } from '@/components/fridges/MemberSheet'
import { useFridgeDetail } from '@/contexts/FridgeDetailContext'

type StorageType = '전체' | '냉장' | '냉동'
type SortType = '유통기한순' | '등록일순'

function isNoticePermanentlyDismissed(id: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`notice_permanent_${id}`) === 'true'
}

function dismissNoticePermanent(id: string) {
  localStorage.setItem(`notice_permanent_${id}`, 'true')
}

const MOCK_FRIDGE = { name: '거실 냉장고', location: '주방 • 402호' }
const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Sarah J.',
    initial: 'S',
    color: 'bg-primary-200 text-primary-700',
    role: '관리자',
  },
  {
    id: 'm2',
    name: 'Marcus L.',
    initial: 'M',
    color: 'bg-secondary-200 text-secondary-700',
    role: '멤버',
  },
  {
    id: 'm3',
    name: '김민지',
    initial: '민',
    color: 'bg-tertiary-200 text-tertiary-700',
    role: '멤버',
  },
  {
    id: 'm4',
    name: '이준호',
    initial: '준',
    color: 'bg-neutral-200 text-neutral-600',
    role: '멤버',
  },
]
const MOCK_NOTICES = [
  { id: 'n1', text: '이번 주말 냉장고 청소 예정입니다! 모두 본인 음식은 미리 확인 부탁드립니다.' },
]
const MOCK_RULES = [
  { id: 'r1', text: '개인 음식엔 꼭 이름을 써주세요' },
  { id: 'r2', text: '유통기한 지난 음식은 바로 버려주세요' },
  { id: 'r3', text: '매달 마지막 날은 냉장고 청소합니다' },
]
const MOCK_ITEMS = [
  {
    id: 'i1',
    name: '유기농 갈라 사과',
    emoji: '🍎',
    addedBy: 'Sarah J.',
    storageType: '냉장' as StorageType,
    expiresIn: 2,
    expiresAt: null,
  },
  {
    id: 'i2',
    name: '신선한 브로콜리',
    emoji: '🥦',
    addedBy: 'Marcus L.',
    storageType: '냉장' as StorageType,
    expiresIn: null,
    expiresAt: '2023. 12. 28',
  },
  {
    id: 'i3',
    name: '버터',
    emoji: '🧈',
    addedBy: 'Sarah J.',
    storageType: '냉장' as StorageType,
    expiresIn: 30,
    expiresAt: null,
  },
  {
    id: 'i4',
    name: '냉동 만두',
    emoji: '🥟',
    addedBy: 'Marcus L.',
    storageType: '냉동' as StorageType,
    expiresIn: 60,
    expiresAt: null,
  },
  {
    id: 'i5',
    name: '참기름',
    emoji: '🫙',
    addedBy: 'Sarah J.',
    storageType: '상온' as StorageType,
    expiresIn: 90,
    expiresAt: null,
  },
]

export default function FridgeDetailPage() {
  const router = useRouter()
  const { fridgeId } = useParams<{ fridgeId: string }>()
  const [storageFilter, setStorageFilter] = useState<StorageType>('전체')
  const [sortBy, setSortBy] = useState<SortType>('유통기한순')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const { isSidePanelOpen, setIsSidePanelOpen, setFridgeName, setFridgeLocation } = useFridgeDetail()
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false)
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setFridgeName(MOCK_FRIDGE.name)
    setFridgeLocation(MOCK_FRIDGE.location)
  }, [setFridgeName, setFridgeLocation])

  useEffect(() => {
    const hidden = new Set(
      MOCK_NOTICES.filter((n) => isNoticePermanentlyDismissed(n.id)).map((n) => n.id),
    )
    setDismissedNoticeIds(hidden)
  }, [])

  const visibleNotices = MOCK_NOTICES.filter((n) => !dismissedNoticeIds.has(n.id))
  const filteredItems = storageFilter === '전체' ? MOCK_ITEMS : MOCK_ITEMS.filter((i) => i.storageType === storageFilter)

  const handleDismissPermanent = () => {
    visibleNotices.forEach((n) => dismissNoticePermanent(n.id))
    setDismissedNoticeIds((prev) => new Set([...prev, ...visibleNotices.map((n) => n.id)]))
    setIsNoticeExpanded(false)
  }

  // 스와이프로 사이드 패널 닫기
  const [swipeDelta, setSwipeDelta] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const delta = e.touches[0].clientX - touchStartX
    if (delta > 0) setSwipeDelta(delta)
  }

  const handleTouchEnd = () => {
    if (swipeDelta > 80) setIsSidePanelOpen(false)
    setSwipeDelta(0)
    setTouchStartX(null)
  }

  return (
    <div className="h-full bg-neutral-50 flex flex-col overflow-hidden">
      {/* 콘텐츠 + 사이드 패널 영역 */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {/* 스크롤 가능한 메인 콘텐츠 */}
        <div className="absolute inset-0 overflow-y-auto">
          <div className="max-w-lg mx-auto w-full flex flex-col gap-2 pt-4 pb-24">
            {/* 공지 — 드롭다운 아코디언 */}
            {visibleNotices.length > 0 && (
              <div className="mx-4">
                <button
                  onClick={() => setIsNoticeExpanded((v) => !v)}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-3 border shadow-sm transition-colors text-left',
                    isNoticeExpanded
                      ? 'bg-primary-50 border-primary-200 rounded-t-2xl'
                      : 'bg-primary-50 border-primary-200 rounded-2xl hover:bg-primary-100',
                  )}
                >
                  <Megaphone size={14} className="text-primary-400 shrink-0" />
                  <p className="flex-1 text-sm text-neutral-700 line-clamp-1 leading-snug min-w-0">
                    {visibleNotices[0].text}
                  </p>
                  <ChevronDown
                    size={13}
                    className={cn(
                      'text-primary-300 shrink-0 transition-transform duration-200',
                      isNoticeExpanded && 'rotate-180',
                    )}
                  />
                </button>
                {isNoticeExpanded && (
                  <div className="flex border border-t-0 border-primary-200 rounded-b-2xl overflow-hidden">
                    <button
                      onClick={handleDismissPermanent}
                      className="flex-1 py-2.5 text-xs font-semibold text-neutral-400 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      다시 열지 않음
                    </button>
                    <div className="w-px bg-primary-200" />
                    <button
                      onClick={() => setIsNoticeExpanded(false)}
                      className="flex-1 py-2.5 text-xs font-semibold text-primary-500 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      접어두기
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 필터 + 정렬 */}
            <div className="flex items-center gap-2 px-4 pt-1">
              {(['전체', '냉장', '냉동'] as StorageType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setStorageFilter(type)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
                    storageFilter === type
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-500 border border-neutral-200',
                  )}
                >
                  {type}
                </button>
              ))}
              <div className="relative ml-auto">
                <button
                  onClick={() => setIsSortOpen((v) => !v)}
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-500 bg-white border border-neutral-200 rounded-full px-3 py-1.5 hover:bg-neutral-50 transition-colors"
                >
                  {sortBy}
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform', isSortOpen && 'rotate-180')}
                  />
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-10 min-w-[100px]">
                    {(['유통기한순', '등록일순'] as SortType[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSortBy(s)
                          setIsSortOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors',
                          sortBy === s
                            ? 'text-primary bg-primary-50'
                            : 'text-neutral-600 hover:bg-neutral-50',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 식재료 목록 */}
            <div className="flex flex-col gap-3 px-4">
              {filteredItems.length === 0 ? (
                <p className="text-center text-sm text-neutral-400 py-8">식재료가 없습니다</p>
              ) : (
                filteredItems.map((item) => <FridgeItemCard key={item.id} {...item} />)
              )}
            </div>
          </div>
        </div>

        {/* 사이드 패널 오버레이 */}
        <div
          className={cn(
            'absolute inset-0 z-[79] bg-black/30 transition-opacity duration-300',
            isSidePanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          )}
          onClick={() => setIsSidePanelOpen(false)}
        />

        {/* 사이드 패널 — 오른쪽에서 슬라이드 */}
        <div
          className={cn(
            'absolute inset-0 z-[80]',
            swipeDelta > 0 ? '' : 'transition-transform duration-300 ease-in-out',
            isSidePanelOpen ? 'translate-x-0' : 'translate-x-full',
          )}
          style={swipeDelta > 0 ? { transform: `translateX(${swipeDelta}px)` } : undefined}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-full bg-white overflow-y-auto max-w-lg mx-auto">
            {/* 규칙 */}
            <div className="px-5 pt-5 pb-2">
              <button
                onClick={() => setIsRulesOpen((v) => !v)}
                className="w-full flex items-center gap-2 py-2"
              >
                <BookOpen size={16} className="text-neutral-500 shrink-0" />
                <span className="text-sm font-semibold text-neutral-700">냉장고 규칙</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'text-neutral-400 ml-auto transition-transform duration-200 shrink-0',
                    isRulesOpen && 'rotate-180',
                  )}
                />
              </button>
              {isRulesOpen && (
                <div className="mt-1 mb-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 flex flex-col gap-2.5">
                  {MOCK_RULES.map((r, i) => (
                    <div key={r.id} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="text-neutral-400 font-bold shrink-0 text-xs mt-0.5">
                        {i + 1}.
                      </span>
                      <span>{r.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 구분선 */}
            <div className="h-px bg-neutral-100 mx-5 my-2" />

            {/* 멤버 */}
            <div className="px-5 pt-3 pb-8">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                멤버 {MOCK_MEMBERS.length}명
              </p>
              <ul className="flex flex-col divide-y divide-neutral-50">
                {MOCK_MEMBERS.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        m.color,
                      )}
                    >
                      {m.initial}
                    </div>
                    <p className="flex-1 font-semibold text-sm text-neutral-800">{m.name}</p>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2.5 py-1 rounded-full',
                        m.role === '관리자'
                          ? 'bg-secondary-100 text-secondary-600'
                          : 'bg-primary-100 text-primary-600',
                      )}
                    >
                      {m.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/fridges/${fridgeId}/add`)}
        className="fixed bottom-20 right-4 flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 font-semibold text-sm z-40"
      >
        <Plus size={18} strokeWidth={2.5} />
        넣기
      </button>
    </div>
  )
}

function FridgeItemCard({
  name,
  emoji,
  addedBy,
  expiresIn,
  expiresAt,
}: {
  name: string
  emoji: string
  addedBy: string
  expiresIn: number | null
  expiresAt: string | null
}) {
  const isExpiringSoon = expiresIn !== null && expiresIn <= 3
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 shadow-sm border border-neutral-100">
      <div className="w-11 h-11 rounded-xl bg-neutral-50 flex items-center justify-center text-2xl shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-neutral-800 text-sm truncate">{name}</p>
          {isExpiringSoon && (
            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
              만료 임박
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">👤 {addedBy} 님이 추가함</p>
        <p
          className={cn(
            'text-xs mt-0.5 font-medium',
            isExpiringSoon ? 'text-red-400' : 'text-neutral-400',
          )}
        >
          {expiresIn !== null ? `남은 기한: ${expiresIn}일` : `유통기한: ${expiresAt}`}
        </p>
      </div>
    </div>
  )
}
