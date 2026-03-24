'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Refrigerator, Users, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

// TODO: 실제 초대 코드로 냉장고 정보 조회
const MOCK_INVITE = {
  fridgeId: '1',
  fridgeName: '우리집 냉장고',
  fridgeEmoji: '🏠',
  spaceName: '김민지의 공간',
  memberCount: 4,
  invitedBy: 'Sarah J.',
  role: 'member' as const,
}

type JoinState = 'idle' | 'joining' | 'done' | 'already' | 'expired'

export default function InvitePage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [state, setState] = useState<JoinState>('idle')

  // TODO: code가 유효하지 않으면 'expired'로 설정
  const isExpired = code === 'expired'

  if (isExpired) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center px-6 bg-white">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-base font-bold text-neutral-800 mb-2">초대 링크가 만료됐어요</p>
        <p className="text-sm text-neutral-400 text-center leading-relaxed mb-8">
          링크가 유효하지 않거나 이미 사용됐어요.
          <br />초대한 사람에게 다시 요청해 보세요.
        </p>
        <button
          onClick={() => router.push('/fridges')}
          className="px-6 py-3 rounded-xl bg-neutral-100 text-sm font-bold text-neutral-600"
        >
          홈으로 돌아가기
        </button>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="h-dvh flex flex-col items-center justify-center px-6 bg-white">
        <p className="text-5xl mb-4">🎉</p>
        <p className="text-base font-bold text-neutral-800 mb-2">참여 완료!</p>
        <p className="text-sm text-neutral-400 text-center leading-relaxed mb-8">
          <span className="font-semibold text-neutral-600">{MOCK_INVITE.fridgeName}</span>에
          <br />합류했어요.
        </p>
        <button
          onClick={() => router.push(`/fridges/${MOCK_INVITE.fridgeId}`)}
          className="w-full max-w-xs py-4 rounded-2xl bg-primary text-white font-bold text-sm"
        >
          냉장고 보러가기
        </button>
      </div>
    )
  }

  const handleJoin = () => {
    setState('joining')
    // TODO: 실제 참여 API 호출
    setTimeout(() => setState('done'), 800)
  }

  return (
    <div className="h-dvh flex flex-col bg-white">
      {/* 상단 여백 + 일러스트 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 냉장고 아이콘 */}
        <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mb-5 text-4xl">
          {MOCK_INVITE.fridgeEmoji}
        </div>

        {/* 초대 메시지 */}
        <p className="text-xs text-neutral-400 mb-1">
          <span className="font-semibold text-neutral-600">{MOCK_INVITE.invitedBy}</span>님이 초대했어요
        </p>
        <p className="text-xl font-bold text-neutral-900 mb-1 text-center">
          {MOCK_INVITE.fridgeName}
        </p>
        <p className="text-xs text-neutral-400 mb-8">{MOCK_INVITE.spaceName}</p>

        {/* 정보 카드 */}
        <div className="w-full max-w-xs bg-neutral-50 rounded-2xl divide-y divide-neutral-100">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Users size={15} className="text-neutral-400 shrink-0" />
            <span className="text-xs text-neutral-500 flex-1">현재 멤버</span>
            <span className="text-xs font-bold text-neutral-700">{MOCK_INVITE.memberCount}명</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Refrigerator size={15} className="text-neutral-400 shrink-0" />
            <span className="text-xs text-neutral-500 flex-1">공간</span>
            <span className="text-xs font-bold text-neutral-700">{MOCK_INVITE.spaceName}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <ShieldCheck size={15} className="text-neutral-400 shrink-0" />
            <span className="text-xs text-neutral-500 flex-1">참여 후 권한</span>
            <span className="text-xs font-bold text-neutral-700">멤버</span>
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="px-6 pb-10 pt-4 flex flex-col gap-3">
        <button
          onClick={handleJoin}
          disabled={state === 'joining'}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-sm transition-colors',
            state === 'joining'
              ? 'bg-primary/60 text-white'
              : 'bg-primary text-white active:bg-primary/90',
          )}
        >
          {state === 'joining' ? '참여 중...' : '참여하기'}
        </button>
        <button
          onClick={() => router.push('/fridges')}
          className="w-full py-3 text-sm font-medium text-neutral-400"
        >
          나중에 할게요
        </button>
      </div>
    </div>
  )
}
