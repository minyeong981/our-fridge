'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Refrigerator } from 'lucide-react'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

  const handleKakaoLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
        scopes: 'profile_nickname profile_image',
      },
    })
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    })
  }

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-white px-6">
      {/* 로고 */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
          <Refrigerator size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">우리의 냉장고</h1>
        <p className="text-sm text-neutral-400 mt-1">공용 냉장고를 함께 관리해요</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="w-full max-w-xs mb-4 px-4 py-3 rounded-xl bg-red-50 text-sm text-red-500 text-center">
          로그인에 실패했어요. 다시 시도해 주세요.
        </div>
      )}

      {/* 로그인 버튼 */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          <KakaoIcon />
          카카오로 시작하기
        </button>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-white border border-neutral-200 text-neutral-700"
        >
          <GoogleIcon />
          구글로 시작하기
        </button>
      </div>

      <p className="text-xs text-neutral-400 mt-8 text-center leading-relaxed">
        로그인 시 서비스 이용약관 및<br />개인정보처리방침에 동의하게 됩니다.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1C4.582 1 1 3.896 1 7.468c0 2.282 1.515 4.282 3.797 5.433L3.93 16.16a.25.25 0 0 0 .375.272L8.49 13.9c.17.012.34.018.51.018 4.418 0 8-2.896 8-6.468C17 3.896 13.418 1 9 1Z"
        fill="#191919"
      />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
