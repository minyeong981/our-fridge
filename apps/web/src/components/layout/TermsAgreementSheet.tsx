'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { createClient } from '@/lib/supabase/client'

const PRIVACY_URL = 'https://www.notion.so/3300d8d7efe380a79f3dcfc9ea0c7274'
const TERMS_URL = 'https://www.notion.so/3300d8d7efe380b59bfce25f34226368'

function openUrl(url: string) {
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'open_url', url }))
  } else {
    window.open(url, '_blank')
  }
}

export function TermsAgreementSheet() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const termsAgreed = useAuthStore((s) => s.termsAgreed)
  const setTermsAgreed = useAuthStore((s) => s.setTermsAgreed)

  const [checkedTerms, setCheckedTerms] = useState(false)
  const [checkedPrivacy, setCheckedPrivacy] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 로딩 중이거나, 미인증이거나, 이미 동의했으면 숨김
  if (loading || !user || termsAgreed) return null

  const allChecked = checkedTerms && checkedPrivacy

  function toggleAll() {
    const next = !allChecked
    setCheckedTerms(next)
    setCheckedPrivacy(next)
  }

  return (
    <>
      {/* 배경 — 탭해도 닫히지 않음 */}
      <div className="fixed inset-0 bg-black/50 z-[400]" />

      <div className="fixed inset-x-0 bottom-0 z-[401] bg-white rounded-t-3xl flex flex-col">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-neutral-200 rounded-full" />
        </div>

        <div className="px-6 pt-4 pb-2">
          <p className="text-lg font-bold text-neutral-900">서비스 이용 동의</p>
          <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
            우리의 냉장고를 시작하기 전에 아래 내용을 확인해주세요.
          </p>
        </div>

        {/* 전체 동의 */}
        <button
          onClick={toggleAll}
          className="mx-6 mt-4 flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 active:bg-neutral-100 transition-colors"
        >
          <div className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
            allChecked ? 'bg-primary border-primary' : 'border-neutral-300',
          )}>
            {allChecked && <Check size={12} strokeWidth={3} className="text-white" />}
          </div>
          <span className="text-sm font-bold text-neutral-900">전체 동의</span>
        </button>

        {/* 구분선 */}
        <div className="mx-6 my-3 border-t border-neutral-100" />

        {/* 개별 항목 */}
        <div className="px-6 flex flex-col gap-3">
          {/* 이용약관 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCheckedTerms((v) => !v)}
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                checkedTerms ? 'bg-primary border-primary' : 'border-neutral-300',
              )}
            >
              {checkedTerms && <Check size={12} strokeWidth={3} className="text-white" />}
            </button>
            <span className="flex-1 text-sm text-neutral-700">
              <span className="text-neutral-400 mr-1">[필수]</span>이용약관 동의
            </span>
            <button
              onClick={() => openUrl(TERMS_URL)}
              className="text-xs text-neutral-400 underline underline-offset-2 shrink-0"
            >
              보기
            </button>
          </div>

          {/* 개인정보처리방침 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCheckedPrivacy((v) => !v)}
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                checkedPrivacy ? 'bg-primary border-primary' : 'border-neutral-300',
              )}
            >
              {checkedPrivacy && <Check size={12} strokeWidth={3} className="text-white" />}
            </button>
            <span className="flex-1 text-sm text-neutral-700">
              <span className="text-neutral-400 mr-1">[필수]</span>개인정보처리방침 동의
            </span>
            <button
              onClick={() => openUrl(PRIVACY_URL)}
              className="text-xs text-neutral-400 underline underline-offset-2 shrink-0"
            >
              보기
            </button>
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="px-6 pt-5 pb-safe">
          <button
            onClick={async () => {
              if (!user) return
              setSubmitting(true)
              const supabase = createClient()
              await supabase
                .from('profiles')
                .update({ terms_agreed_at: new Date().toISOString() })
                .eq('id', user.id)
              setTermsAgreed(true)
              setSubmitting(false)
            }}
            disabled={!allChecked || submitting}
            className={cn(
              'w-full py-4 rounded-2xl text-sm font-bold transition-colors',
              allChecked
                ? 'bg-primary text-white'
                : 'bg-neutral-100 text-neutral-400',
            )}
          >
            {submitting
              ? <Loader2 size={16} className="animate-spin mx-auto" />
              : '동의하고 시작하기'
            }
          </button>
          <div className="h-3" />
        </div>
      </div>
    </>
  )
}
