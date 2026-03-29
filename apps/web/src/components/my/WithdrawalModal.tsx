'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronRight, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAdminFridgesNeedingDelegation,
  deleteAccount,
  updateMemberRole,
  type FridgeNeedingDelegation,
} from '@our-fridge/api'
import { createClient } from '@/lib/supabase/client'

type Step = 'loading' | 'delegate' | 'notice' | 'confirm'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function WithdrawalModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('loading')
  const [fridgesNeedingDelegate, setFridgesNeedingDelegate] = useState<FridgeNeedingDelegation[]>([])
  // fridgeId → 선택된 새 관리자 userId
  const [delegations, setDelegations] = useState<Record<string, string>>({})
  const [isDelegating, setIsDelegating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setStep('loading')
    setError(null)
    setDelegations({})

    getAdminFridgesNeedingDelegation()
      .then((fridges) => {
        setFridgesNeedingDelegate(fridges)
        setStep(fridges.length > 0 ? 'delegate' : 'notice')
      })
      .catch(() => setStep('notice'))
  }, [isOpen])

  if (!isOpen) return null

  const allDelegated = fridgesNeedingDelegate.every((f) => !!delegations[f.fridgeId])

  async function handleDelegate() {
    setIsDelegating(true)
    setError(null)
    try {
      await Promise.all(
        fridgesNeedingDelegate.map((f) => {
          const newAdminId = delegations[f.fridgeId]
          if (!newAdminId) throw new Error(`${f.fridgeName} 냉장고의 관리자를 선택해주세요`)
          return updateMemberRole(f.fridgeId, newAdminId, 'admin')
        }),
      )
      setStep('notice')
    } catch (e: any) {
      setError(e?.message ?? '오류가 발생했어요')
    } finally {
      setIsDelegating(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)
    setError(null)
    try {
      await deleteAccount()
      // 로컬 세션 정리
      const supabase = createClient()
      await supabase.auth.signOut()
      // RN WebView에 로그아웃 알림
      if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
        ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'logout' }))
      }
      router.replace('/login')
    } catch (e: any) {
      setError(e?.message ?? '탈퇴 처리 중 오류가 발생했어요')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[300]" onClick={onClose} />
      <div className="fixed inset-0 z-[301] flex items-end justify-center px-0 sm:items-center sm:px-4">
        <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[85vh]">

          {/* 헤더 */}
          <div className="shrink-0 flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100">
            <h2 className="font-bold text-base text-neutral-900">
              {step === 'loading' && '잠시만요...'}
              {step === 'delegate' && '관리자 위임'}
              {step === 'notice' && '탈퇴 전 확인'}
              {step === 'confirm' && '정말 탈퇴할까요?'}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X size={16} className="text-neutral-500" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto">

            {/* 로딩 */}
            {step === 'loading' && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="text-primary animate-spin" />
              </div>
            )}

            {/* 위임 */}
            {step === 'delegate' && (
              <div className="px-5 py-5 flex flex-col gap-5">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  관리자가 나뿐인 냉장고가 있어요.
                  탈퇴하기 전에 다른 멤버를 관리자로 지정해주세요.
                </p>
                {fridgesNeedingDelegate.map((fridge) => (
                  <div key={fridge.fridgeId} className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                      {fridge.fridgeName}
                    </p>
                    <div className="border border-neutral-100 rounded-2xl overflow-hidden divide-y divide-neutral-50">
                      {fridge.members.map((m) => {
                        const selected = delegations[fridge.fridgeId] === m.userId
                        return (
                          <button
                            key={m.userId}
                            onClick={() =>
                              setDelegations((prev) => ({
                                ...prev,
                                [fridge.fridgeId]: m.userId,
                              }))
                            }
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors',
                              selected ? 'bg-primary-50' : 'bg-white active:bg-neutral-50',
                            )}
                          >
                            {m.avatarUrl ? (
                              <img
                                src={m.avatarUrl.replace(/^http:\/\//, 'https://')}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-neutral-500">
                                  {m.name?.[0] ?? '?'}
                                </span>
                              </div>
                            )}
                            <span className="flex-1 text-sm font-semibold text-neutral-800">
                              {m.name ?? '알 수 없음'}
                            </span>
                            {selected && (
                              <Check size={16} className="text-primary shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 고지 */}
            {(step === 'notice' || step === 'confirm') && (
              <div className="px-5 py-5 flex flex-col gap-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl">
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 leading-relaxed font-medium">
                    탈퇴 후에는 계정을 복구할 수 없어요.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide px-1 mb-2">
                    탈퇴하면 사라지는 것들
                  </p>
                  {[
                    '내 프로필 (이름, 사진)',
                    '모든 냉장고 멤버십',
                    '내가 유일한 멤버인 냉장고',
                    '로그인 계정 (이메일/소셜)',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 px-1 py-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="text-sm text-neutral-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide px-1 mb-2">
                    탈퇴해도 남는 것들
                  </p>
                  {[
                    '커뮤니티 게시글 (작성자: "탈퇴한 사용자"로 변경)',
                    '댓글 · 답글 (작성자: "탈퇴한 사용자"로 변경)',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 px-1 py-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />
                      <span className="text-sm text-neutral-500">{item}</span>
                    </div>
                  ))}
                </div>

                {step === 'confirm' && (
                  <div className="mt-2 p-4 border border-red-100 rounded-2xl bg-red-50">
                    <p className="text-sm font-bold text-red-600 text-center">
                      위 내용을 확인했으며, 탈퇴에 동의합니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 에러 */}
          {error && (
            <div className="shrink-0 px-5 pb-2">
              <p className="text-xs text-red-500 text-center">{error}</p>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="shrink-0 px-5 py-4 border-t border-neutral-100 flex gap-2 pb-safe">
            {step === 'delegate' && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-neutral-200 text-sm font-semibold text-neutral-600"
                >
                  취소
                </button>
                <button
                  onClick={handleDelegate}
                  disabled={!allDelegated || isDelegating}
                  className={cn(
                    'flex-1 py-3.5 rounded-2xl text-sm font-bold transition-colors',
                    allDelegated && !isDelegating
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-400',
                  )}
                >
                  {isDelegating ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : (
                    '위임하고 다음'
                  )}
                </button>
              </>
            )}

            {step === 'notice' && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-neutral-200 text-sm font-semibold text-neutral-600"
                >
                  취소
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 py-3.5 rounded-2xl bg-neutral-800 text-white text-sm font-bold flex items-center justify-center gap-1"
                >
                  다음
                  <ChevronRight size={14} />
                </button>
              </>
            )}

            {step === 'confirm' && (
              <>
                <button
                  onClick={() => setStep('notice')}
                  className="flex-1 py-3.5 rounded-2xl border border-neutral-200 text-sm font-semibold text-neutral-600"
                >
                  돌아가기
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white text-sm font-bold"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : (
                    '탈퇴하기'
                  )}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
