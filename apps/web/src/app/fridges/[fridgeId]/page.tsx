'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Megaphone,
  BookOpen,
  QrCode,
  Link2,
  Settings,
  UserMinus,
  User,
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Member } from '@/components/fridges/MemberSheet'
import { useFridgeDetail } from '@/contexts/FridgeDetailContext'
import { FridgeFormPanel } from '@/components/fridges/FridgeFormPanel'
import { NoticeModal } from '@/components/fridges/NoticeModal'
import { QrInviteModal } from '@/components/fridges/QrInviteModal'
import { Toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  getFridge,
  deleteFridge,
  getMembersByFridge,
  removeMember,
  updateFridge,
  getItemsByFridge,
} from '@our-fridge/api'
import type { Item } from '@our-fridge/shared'
import { useAuth } from '@/contexts/AuthContext'

type StorageType = '전체' | '냉장' | '냉동'
type SortType = '유통기한순' | '등록일순'

const SIDE_PANEL_CHEVRON_SIZE = 14
const SIDE_PANEL_CHEVRON_COLOR = 'text-neutral-300'

function getNoticeDismissKey(fridgeId: string) {
  return `notice_dismissed_${fridgeId}`
}

const DAYS_EXPIRY_SOON = 3

export default function FridgeDetailPage() {
  const router = useRouter()
  const { fridgeId } = useParams<{ fridgeId: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [storageFilter, setStorageFilter] = useState<StorageType>('전체')
  const [sortBy, setSortBy] = useState<SortType>('유통기한순')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const { isSidePanelOpen, setIsSidePanelOpen, setFridgeName, setFridgeLocation } =
    useFridgeDetail()
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false)
  const [noticeFolded, setNoticeFolded] = useState(() => {
    if (typeof globalThis.window === 'undefined') return false
    return globalThis.window.sessionStorage.getItem(`notice_folded_${fridgeId}`) === 'true'
  })
  const [noticeDismissed, setNoticeDismissed] = useState(() => {
    if (typeof globalThis.window === 'undefined') return false
    return globalThis.window.localStorage.getItem(getNoticeDismissKey(fridgeId)) === 'true'
  })
  const [isFridgeSettingsPanelOpen, setIsFridgeSettingsPanelOpen] = useState(false)
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false)
  const [isReplaceNoticeConfirmOpen, setIsReplaceNoticeConfirmOpen] = useState(false)
  const [isRemoveNoticeConfirmOpen, setIsRemoveNoticeConfirmOpen] = useState(false)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)

  const { data: fridge } = useQuery({
    queryKey: ['fridge', fridgeId],
    queryFn: () => getFridge(fridgeId),
    enabled: !!fridgeId,
  })

  const { data: items = [] } = useQuery({
    queryKey: ['items', fridgeId],
    queryFn: () => getItemsByFridge(fridgeId),
    enabled: !!fridgeId,
  })

  const { data: rawMembers = [] } = useQuery({
    queryKey: ['members', fridgeId],
    queryFn: () => getMembersByFridge(fridgeId),
    enabled: !!fridgeId,
  })

  const myMembership = rawMembers.find((m) => m.userId === user?.id)
  const isAdmin = myMembership?.role === 'owner' || myMembership?.role === 'admin'

  const members: Member[] = rawMembers.map((m) => ({
    id: m.id,
    name: m.name ?? m.userId,
    avatarUrl: m.avatarUrl,
    role: m.role === 'owner' || m.role === 'admin' ? '관리자' : '멤버',
    isMe: m.userId === user?.id,
  }))

  const sortedMembers = [
    ...members.filter((m) => m.isMe),
    ...members.filter((m) => !m.isMe && m.role === '관리자'),
    ...members.filter((m) => !m.isMe && m.role !== '관리자'),
  ]

  const { mutate: removeNotice } = useMutation({
    mutationFn: () => updateFridge(fridgeId, { notice: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridge', fridgeId] })
      setNoticeFolded(false)
      setNoticeDismissed(false)
      globalThis.window?.sessionStorage.removeItem(`notice_folded_${fridgeId}`)
      globalThis.window?.localStorage.removeItem(getNoticeDismissKey(fridgeId))
    },
  })

  const handleOpenNoticeModal = () => {
    // 공지가 이미 있고 사용자가 아직 보고 있는 상태면 확인 모달
    if (fridge?.notice && !noticeDismissed) {
      setIsReplaceNoticeConfirmOpen(true)
    } else {
      setIsNoticeModalOpen(true)
    }
  }

  const { mutate: handleRemoveMember } = useMutation({
    mutationFn: (memberId: string) => {
      const m = rawMembers.find((rm) => rm.id === memberId)
      if (!m) throw new Error('멤버를 찾을 수 없어요')
      return removeMember(fridgeId, m.userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', fridgeId] })
      setMemberToRemove(null)
    },
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: () => deleteFridge(fridgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-fridges'] })
      router.push('/fridges')
    },
  })

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  const inviteUrl = `${siteUrl}/invite/MOCK_CODE_${fridgeId}`

  const handleCopyLink = async () => {
    setIsSidePanelOpen(false)
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setToastMessage('링크가 복사됐어요 🔗')
    } catch {
      // http 환경(에뮬레이터 등) 폴백
      const el = document.createElement('textarea')
      el.value = inviteUrl
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      setToastMessage(ok ? '링크가 복사됐어요 🔗' : '복사에 실패했어요')
    }
  }

  const handleOpenQr = () => {
    setIsSidePanelOpen(false)
    setTimeout(() => setIsQrModalOpen(true), 300)
  }

  useEffect(() => {
    if (fridge) {
      setFridgeName(fridge.name)
      setFridgeLocation(fridge.location ?? '')
    }
  }, [fridge, setFridgeName, setFridgeLocation])

  const hasNotice = !!fridge?.notice && !noticeDismissed && !noticeFolded

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === '유통기한순') {
      if (!a.expireDate && !b.expireDate) return 0
      if (!a.expireDate) return 1
      if (!b.expireDate) return -1
      return a.expireDate.localeCompare(b.expireDate)
    }
    return b.createdAt.localeCompare(a.createdAt)
  })

  const filteredItems =
    storageFilter === '전체'
      ? sortedItems
      : sortedItems.filter((i) => i.storageType === storageFilter)

  const handleDismissPermanent = () => {
    globalThis.window?.localStorage.setItem(getNoticeDismissKey(fridgeId), 'true')
    setNoticeDismissed(true)
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
            {hasNotice && (
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
                    {fridge!.notice}
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
                      다시 안 보기
                    </button>
                    <div className="w-px bg-primary-200" />
                    <button
                      onClick={() => {
                        globalThis.window?.sessionStorage.setItem(
                          `notice_folded_${fridgeId}`,
                          'true',
                        )
                        setNoticeFolded(true)
                        setIsNoticeExpanded(false)
                      }}
                      className="flex-1 py-2.5 text-xs font-semibold text-primary-500 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      접어두기
                    </button>
                    {isAdmin && (
                      <>
                        <div className="w-px bg-primary-200" />
                        <button
                          onClick={() => setIsRemoveNoticeConfirmOpen(true)}
                          className="flex-1 py-2.5 text-xs font-semibold text-red-400 bg-primary-50 hover:bg-red-50 transition-colors"
                        >
                          제거하기
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 접힌 공지 복원 버튼 */}
            {noticeFolded && fridge?.notice && (
              <div className="px-4">
                <button
                  onClick={() => {
                    globalThis.window?.sessionStorage.removeItem(`notice_folded_${fridgeId}`)
                    setNoticeFolded(false)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-500 border border-primary-200"
                >
                  <Megaphone size={11} />
                  공지 보기
                </button>
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

            {/* 음식 목록 */}
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-5 px-4 text-center min-h-[55vh]">
                <div className="text-5xl">🥪</div>
                <div>
                  <p className="font-bold text-neutral-700 text-base">아직 저장된 음식이 없어요</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    음식을 추가하고
                    <br />
                    유통기한을 함께 관리해보세요
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-4">
                {filteredItems.map((item) => (
                  <FridgeItemCard
                    key={item.id}
                    item={item}
                    fridgeId={fridgeId}
                    today={today}
                    registeredByName={rawMembers.find((m) => m.userId === item.registeredBy)?.name ?? null}
                  />
                ))}
              </div>
            )}
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
          <div className="h-full bg-white overflow-y-auto max-w-lg mx-auto pb-8">
            {/* 규칙 */}
            <div className="px-5 pt-5 pb-2">
              <button
                onClick={() => setIsRulesOpen((v) => !v)}
                className="w-full flex items-center gap-2 py-2"
              >
                <BookOpen size={16} className="text-neutral-500 shrink-0" />
                <span className="text-sm font-semibold text-neutral-700">냉장고 규칙</span>
                <ChevronDown
                  size={SIDE_PANEL_CHEVRON_SIZE}
                  className={cn(
                    `${SIDE_PANEL_CHEVRON_COLOR} ml-auto transition-transform duration-200 shrink-0`,
                    isRulesOpen && 'rotate-180',
                  )}
                />
              </button>
              {isRulesOpen && (
                <div className="mt-1 mb-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  {fridge?.rules ? (
                    <div className="flex flex-col gap-2.5">
                      {fridge.rules
                        .split('\n')
                        .filter(Boolean)
                        .map((line, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                            <span className="text-neutral-400 font-bold shrink-0 text-xs mt-0.5">
                              {i + 1}.
                            </span>
                            <span>{line}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400 text-center py-1">
                      등록된 규칙이 없어요
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* 관리자 섹션 */}
            {isAdmin && (
              <>
                <div className="h-px mx-5 my-1" />
                <div className="px-5">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                    관리
                  </p>
                  <button
                    onClick={handleOpenNoticeModal}
                    className="w-full flex items-center gap-3 py-3 text-sm font-semibold text-neutral-700 hover:text-primary transition-colors text-left"
                  >
                    <Megaphone size={16} className="text-neutral-400 shrink-0" />
                    <span className="flex-1">공지 작성</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSidePanelOpen(false)
                      setIsFridgeSettingsPanelOpen(true)
                    }}
                    className="w-full flex items-center gap-3 py-3 text-sm font-semibold text-neutral-700 hover:text-primary transition-colors text-left"
                  >
                    <Settings size={16} className="text-neutral-400 shrink-0" />
                    <span className="flex-1">냉장고 설정</span>
                    <ChevronRight
                      size={SIDE_PANEL_CHEVRON_SIZE}
                      className={`${SIDE_PANEL_CHEVRON_COLOR} shrink-0`}
                    />
                  </button>
                </div>
              </>
            )}

            {/* <div className="h-px bg-neutral-100 mx-5 my-2" /> */}

            {/* 멤버 */}
            <div className="px-5 pt-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  멤버 {members.length}명
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={handleOpenQr}
                    className="flex items-center gap-1 text-xs font-semibold text-primary px-2.5 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <QrCode size={12} /> QR
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 text-xs font-semibold text-primary px-2.5 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Link2 size={12} /> 링크
                  </button>
                </div>
              </div>
              <ul className="flex flex-col">
                {sortedMembers.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-3">
                    <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                      {m.avatarUrl ? (
                        <img
                          src={m.avatarUrl.replace(/^http:\/\//, 'https://')}
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={14} className="text-primary" />
                      )}
                    </div>
                    <p className="flex-1 font-semibold text-sm text-neutral-800">
                      {m.name}
                      {m.isMe && (
                        <span className="ml-1.5 text-xs font-normal text-neutral-400">나</span>
                      )}
                    </p>
                    {m.role === '관리자' && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-600">
                        관리자
                      </span>
                    )}
                    {isAdmin && !m.isMe && m.role !== '관리자' && (
                      <button
                        onClick={() => setMemberToRemove(m)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                      >
                        <UserMinus size={14} className="text-red-400" />
                      </button>
                    )}
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
        추가
      </button>

      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        fridgeId={fridgeId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['fridge', fridgeId] })
          setIsSidePanelOpen(false)
          setNoticeFolded(false)
          setNoticeDismissed(false)
          globalThis.window?.sessionStorage.removeItem(`notice_folded_${fridgeId}`)
          globalThis.window?.localStorage.removeItem(getNoticeDismissKey(fridgeId))
        }}
      />

      <ConfirmModal
        isOpen={isReplaceNoticeConfirmOpen}
        title="공지를 교체할까요?"
        description="기존 공지가 새 공지로 대체돼요."
        confirmLabel="작성하기"
        onConfirm={() => {
          setIsReplaceNoticeConfirmOpen(false)
          setIsNoticeModalOpen(true)
        }}
        onCancel={() => setIsReplaceNoticeConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={isRemoveNoticeConfirmOpen}
        title="공지를 제거할까요?"
        description="모든 멤버에게 공지가 사라져요."
        confirmLabel="제거하기"
        onConfirm={() => {
          setIsRemoveNoticeConfirmOpen(false)
          setIsNoticeExpanded(false)
          removeNotice()
        }}
        onCancel={() => setIsRemoveNoticeConfirmOpen(false)}
        destructive
      />

      {isQrModalOpen && (
        <QrInviteModal
          fridgeName={fridge?.name ?? ''}
          inviteUrl={inviteUrl}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDone={() => setToastMessage(null)} />}

      <ConfirmModal
        isOpen={!!memberToRemove}
        title={`${memberToRemove?.name}을(를) 내보낼까요?`}
        description="멤버를 냉장고에서 제거하면 더 이상 접근할 수 없게 돼요."
        confirmLabel="내보내기"
        onConfirm={() => {
          if (memberToRemove) handleRemoveMember(memberToRemove.id)
        }}
        onCancel={() => setMemberToRemove(null)}
        destructive
      />

      {fridge && (
        <FridgeFormPanel
          isOpen={isFridgeSettingsPanelOpen}
          onClose={() => setIsFridgeSettingsPanelOpen(false)}
          fridgeId={fridgeId}
          initialData={{
            emoji: fridge.emoji,
            name: fridge.name,
            location: fridge.location ?? '',
            memo: fridge.description ?? '',
            rules: fridge.rules ?? '',
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['fridge', fridgeId] })
            queryClient.invalidateQueries({ queryKey: ['user-fridges'] })
          }}
          onDelete={() => {
            setIsFridgeSettingsPanelOpen(false)
            handleDelete()
          }}
        />
      )}
    </div>
  )
}

function FridgeItemCard({
  item,
  fridgeId,
  today,
  registeredByName,
}: {
  item: Item
  fridgeId: string
  today: Date
  registeredByName?: string | null
}) {
  const router = useRouter()

  const expireDate = item.expireDate ? new Date(item.expireDate) : null
  const daysLeft = expireDate
    ? Math.floor((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const isExpiringSoon = daysLeft !== null && daysLeft <= DAYS_EXPIRY_SOON
  const isExpired = daysLeft !== null && daysLeft < 0

  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

  return (
    <div
      onClick={() => router.push(`/fridges/${fridgeId}/items/${item.id}`)}
      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-neutral-100 cursor-pointer active:bg-neutral-50 transition-colors"
    >
      <div className="w-14 h-14 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">🧊</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-neutral-800 text-sm truncate">{item.name}</p>
          {isExpired && (
            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
              기한 초과
            </span>
          )}
          {!isExpired && isExpiringSoon && (
            <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
              만료 임박
            </span>
          )}
        </div>
        {expireDate ? (
          <p className={cn(
            'text-xs font-medium',
            isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-500' : 'text-neutral-400',
          )}>
            {fmt(expireDate)}
            <span className="ml-1.5 opacity-70">
              {isExpired ? `(${Math.abs(daysLeft!)}일 초과)` : `(D-${daysLeft})`}
            </span>
          </p>
        ) : (
          <p className="text-xs text-neutral-300 font-medium">유통기한 없음</p>
        )}
        {registeredByName && (
          <p className="text-[11px] text-neutral-300 mt-0.5">{registeredByName}님이 등록함</p>
        )}
      </div>
    </div>
  )
}
