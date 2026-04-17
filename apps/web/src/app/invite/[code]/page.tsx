'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Refrigerator, Users, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFridge, getMembersByFridge, addMember } from '@our-fridge/api'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Fridge } from '@our-fridge/shared'
import type { MemberWithProfile } from '@our-fridge/api'

// TODO: 앱 출시 후 실제 Google Play URL로 교체
const PLAY_STORE_URL = '#'

type JoinState = 'idle' | 'joining' | 'done' | 'error'
type LoadState = 'loading' | 'ready' | 'not_found'

export default function InvitePage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [joinState, setJoinState] = useState<JoinState>('idle')
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [fridge, setFridge] = useState<Fridge | null>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [ownerName, setOwnerName] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [fridgeData, members] = await Promise.all([
          getFridge(code),
          getMembersByFridge(code).catch(() => [] as MemberWithProfile[]),
        ])
        setFridge(fridgeData)
        setMemberCount(members.length)
        setOwnerName(members.find((m) => m.role === 'owner')?.name ?? null)
        setLoadState('ready')
      } catch {
        setLoadState('not_found')
      }
    }
    load()
  }, [code])

  const handleJoin = async () => {
    if (!user || !fridge) return
    setJoinState('joining')
    try {
      await addMember(fridge.id, user.id)
      setJoinState('done')
    } catch {
      setJoinState('error')
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="h-dvh flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (loadState === 'not_found') {
    return (
      <div className="h-dvh flex flex-col items-center justify-center px-6 bg-white">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-base font-bold text-neutral-800 mb-2">초대 링크가 만료됐어요</p>
        <p className="text-sm text-neutral-400 text-center leading-relaxed mb-8">
          링크가 유효하지 않거나 이미 사용됐어요.
          <br />
          초대한 사람에게 다시 요청해 보세요.
        </p>
      </div>
    )
  }

  if (joinState === 'done' && fridge) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center px-6 bg-white">
        <p className="text-5xl mb-4">🎉</p>
        <p className="text-base font-bold text-neutral-800 mb-2">참여 완료!</p>
        <p className="text-sm text-neutral-400 text-center leading-relaxed mb-8">
          <span className="font-semibold text-neutral-600">{fridge.name}</span>에
          <br />
          합류했어요.
        </p>
        <button
          onClick={() => router.push(`/fridges/${fridge.id}`)}
          className="w-full max-w-xs py-4 rounded-2xl bg-primary text-white font-bold text-sm"
        >
          냉장고 보러가기
        </button>
      </div>
    )
  }

  const isInApp =
    typeof window !== 'undefined' && /OurFridgeApp/.test(navigator.userAgent)

  if (isInApp) {
    return (
      <div className="h-dvh flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mb-5 text-4xl">
            {fridge!.emoji ?? '🧊'}
          </div>
          {ownerName && (
            <p className="text-xs text-neutral-400 mb-1">
              <span className="font-semibold text-neutral-600">{ownerName}</span>님이 초대했어요
            </p>
          )}
          <p className="text-xl font-bold text-neutral-900 mb-6 text-center">
            {fridge!.name}
          </p>
          <div className="w-full max-w-xs bg-neutral-50 rounded-2xl divide-y divide-neutral-100">
            {memberCount > 0 && (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Users size={15} className="text-neutral-400 shrink-0" />
                <span className="text-xs text-neutral-500 flex-1">현재 멤버</span>
                <span className="text-xs font-bold text-neutral-700">{memberCount}명</span>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <ShieldCheck size={15} className="text-neutral-400 shrink-0" />
              <span className="text-xs text-neutral-500 flex-1">참여 후 권한</span>
              <span className="text-xs font-bold text-neutral-700">멤버</span>
            </div>
          </div>
          {joinState === 'error' && (
            <p className="mt-4 text-xs text-red-400 text-center">
              참여 중 오류가 발생했어요. 다시 시도해 주세요.
            </p>
          )}
        </div>
        <div className="px-6 pb-10 pt-4">
          <button
            onClick={handleJoin}
            disabled={joinState === 'joining' || !user}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-sm transition-colors',
              joinState === 'joining' || !user
                ? 'bg-primary/60 text-white'
                : 'bg-primary text-white active:bg-primary/90',
            )}
          >
            {joinState === 'joining' ? '참여 중...' : '참여하기'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col items-center justify-center px-6 bg-white gap-0">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mb-5 text-4xl">
          {fridge!.emoji ?? '🧊'}
        </div>
        {ownerName && (
          <p className="text-xs text-neutral-400 mb-1">
            <span className="font-semibold text-neutral-600">{ownerName}</span>님이 초대했어요
          </p>
        )}
        <p className="text-xl font-bold text-neutral-900 mb-1">{fridge!.name}</p>
        <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
          앱을 설치하고 이 QR을 다시 스캔하면
          <br />
          바로 냉장고에 합류할 수 있어요.
        </p>
      </div>
      <div className="w-full max-w-xs">
        {/* TODO: 앱 출시 후 실제 Google Play URL로 교체 */}
        <a
          href={PLAY_STORE_URL}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neutral-900 text-white text-sm font-bold"
        >
          <Refrigerator size={16} />
          Google Play에서 받기
        </a>
      </div>
    </div>
  )
}
