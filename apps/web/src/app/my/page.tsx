'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import {
  Megaphone,
  FileText,
  Info,
  Moon,
  LogOut,
  UserX,
  ChevronRight,
  FileEdit,
  User,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { WithdrawalModal } from '@/components/my/WithdrawalModal'

const THEME_LABEL: Record<string, string> = {
  light: '라이트',
  dark: '다크',
  system: '시스템',
}

export default function MyPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, profile } = useAuth()
  const [language, setLanguage] = useState<'ko' | 'en' | 'zh' | 'ja'>('ko')
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [showThemeSheet, setShowThemeSheet] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)

  return (
    <div className="h-full bg-neutral-50 overflow-y-auto">
      {/* 프로필 */}
      <div className="bg-white px-5 pt-6 pb-5 flex items-center gap-4">
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl.replace(/^http:\/\//, 'https://')} alt="프로필" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <User size={18} className="text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base text-neutral-900">{profile?.name ?? '사용자'}</p>
          <p className="text-xs text-neutral-400 mt-0.5 truncate">{user?.email ?? ''}</p>
        </div>
      </div>

      {/* 내 활동 */}
      <p className="px-5 pt-5 pb-1.5 text-[11px] font-bold text-neutral-400 tracking-widest">
        내 활동
      </p>
      <div className="bg-white">
        <button
          onClick={() => router.push('/my/posts')}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <FileEdit size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-left">내 게시글</span>
          <ChevronRight size={14} className="text-neutral-300" />
        </button>
      </div>

      {/* 설정 */}
      <p className="px-5 pt-5 pb-1.5 text-[11px] font-bold text-neutral-400 tracking-widest">
        설정
      </p>
      <div className="bg-white divide-y divide-neutral-100">
        {/* 화면 모드 */}
        <button
          onClick={() => setShowThemeSheet(true)}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <Moon size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-left">화면 모드</span>
          <span className="text-xs text-neutral-400 mr-1">{THEME_LABEL[theme ?? 'system']}</span>
          <ChevronRight size={14} className="text-neutral-300" />
        </button>

        {/* TODO: 언어 설정 */}
        {/* <button
          onClick={() => setShowLangSheet(true)}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <Globe size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-left">언어 설정</span>
          <span className="text-xs text-neutral-400 mr-1">
            {{ ko: '한국어', en: 'English', zh: '中文', ja: '日本語' }[language]}
          </span>
          <ChevronRight size={14} className="text-neutral-300" />
        </button> */}
      </div>

      {/* 정보 */}
      <p className="px-5 pt-5 pb-1.5 text-[11px] font-bold text-neutral-400 tracking-widest">
        정보
      </p>
      <div className="bg-white divide-y divide-neutral-100">
        <button
          onClick={() => router.push('/my/notices')}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <Megaphone size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-left">공지사항</span>
          <ChevronRight size={14} className="text-neutral-300" />
        </button>

        <button
          onClick={() => router.push('/my/policy')}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <FileText size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-left">
            약관 및 정책
          </span>
          <ChevronRight size={14} className="text-neutral-300" />
        </button>

        <button
          onClick={() => {
            const url = 'https://docs.google.com/spreadsheets/d/1WQEYHQSMtzsKn2GJWPcAVHYbnGer8q4yp9H5oyas3Ak/edit?usp=sharing'
            if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
              ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'open_url', url }))
            } else {
              window.open(url, '_blank')
            }
          }}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <MessageSquare size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-left">문의하기</span>
          <ChevronRight size={14} className="text-neutral-300" />
        </button>

        <div className="flex items-center gap-3 px-5 py-4">
          <Info size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800">버전 정보</span>
          <span className="text-xs text-neutral-400">v1.0.0</span>
        </div>
      </div>

      {/* 계정 */}
      <p className="px-5 pt-5 pb-1.5 text-[11px] font-bold text-neutral-400 tracking-widest">
        계정
      </p>
      <div className="bg-white divide-y divide-neutral-100">
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
              ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'logout' }))
            }
          }}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <LogOut size={16} className="text-neutral-400 shrink-0" />
          <span className="text-sm font-semibold text-neutral-800">로그아웃</span>
        </button>

        <button
          onClick={() => setShowWithdrawConfirm(true)}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <UserX size={16} className="text-red-400 shrink-0" />
          <span className="text-sm font-semibold text-red-400">탈퇴하기</span>
        </button>
      </div>

      <div className="h-24" />

      {/* 화면 모드 선택 시트 */}
      {showThemeSheet && (
        <>
          <button
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowThemeSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[60] pb-safe">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-neutral-200 rounded-full" />
            </div>
            <p className="text-sm font-bold text-neutral-800 px-5 pt-2 pb-4">화면 모드</p>
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t)
                  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
                    ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'theme_change', theme: t }))
                  }
                  setShowThemeSheet(false)
                }}
                className={cn(
                  'w-full flex items-center justify-between px-5 py-4 text-sm font-semibold',
                  theme === t ? 'text-primary' : 'text-neutral-700',
                )}
              >
                <span>{THEME_LABEL[t]}</span>
                {theme === t && <span className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
            <div className="h-8" />
          </div>
        </>
      )}

      {/* 언어 선택 시트 */}
      {showLangSheet && (
        <>
          <button
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowLangSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[60] pb-safe overflow-y-auto max-h-[60vh]">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-neutral-200 rounded-full" />
            </div>
            <p className="text-sm font-bold text-neutral-800 px-5 pt-2 pb-4">언어 선택</p>
            {(
              [
                { code: 'ko', label: '한국어' },
                { code: 'en', label: 'English' },
                { code: 'zh', label: '中文' },
                { code: 'ja', label: '日本語' },
              ] as const
            ).map(({ code, label }) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code)
                  setShowLangSheet(false)
                }}
                className={cn(
                  'w-full flex items-center justify-between px-5 py-4 text-sm font-semibold',
                  language === code ? 'text-primary' : 'text-neutral-700',
                )}
              >
                <span>{label}</span>
                {language === code && <span className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
            <div className="h-8" />
          </div>
        </>
      )}

      <WithdrawalModal
        isOpen={showWithdrawConfirm}
        onClose={() => setShowWithdrawConfirm(false)}
      />
    </div>
  )
}
