'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Megaphone,
  FileText,
  Info,
  Globe,
  LogOut,
  UserX,
  ChevronRight,
  Refrigerator,
  FileEdit,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ME = {
  name: '김민지',
  initial: '민',
  color: 'bg-primary-100 text-primary-600',
  email: 'minzi@example.com',
}

const MY_FRIDGES = [
  { id: '1', name: '우리집 냉장고', role: 'owner' },
  { id: '2', name: '사무실 냉장고', role: 'member' },
]

const ROLE_LABEL: Record<string, string> = {
  owner: '관리자',
  admin: '부관리자',
  member: '멤버',
}

export default function MyPage() {
  const router = useRouter()
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)

  return (
    <div className="h-full bg-neutral-50 overflow-y-auto">
      {/* 프로필 */}
      <div className="bg-white px-5 pt-6 pb-5 flex items-center gap-4">
        <div
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0',
            ME.color,
          )}
        >
          {ME.initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base text-neutral-900">{ME.name}</p>
          <p className="text-xs text-neutral-400 mt-0.5 truncate">{ME.email}</p>
        </div>
        <button className="text-xs text-neutral-400 border border-neutral-200 rounded-lg px-3 py-1.5 font-medium">
          편집
        </button>
      </div>

      {/* 내 냉장고 */}
      <div className="mt-3 bg-white px-5 py-4">
        <p className="text-xs font-bold text-neutral-400 mb-3">내 냉장고</p>
        <div className="flex flex-col gap-2">
          {MY_FRIDGES.map((f) => (
            <button
              key={f.id}
              onClick={() => router.push(`/fridges/${f.id}`)}
              className="flex items-center gap-3 py-1"
            >
              <Refrigerator size={16} className="text-neutral-400 shrink-0" />
              <span className="flex-1 text-sm font-semibold text-neutral-800 text-left truncate">
                {f.name}
              </span>
              <span className="text-xs text-neutral-400">{ROLE_LABEL[f.role]}</span>
              <ChevronRight size={14} className="text-neutral-300" />
            </button>
          ))}
        </div>
      </div>

      {/* 내 게시글 */}
      <div className="mt-3 bg-white">
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
      <div className="mt-3 bg-white divide-y divide-neutral-50">
        {/* 알림 설정 */}
        <div className="flex items-center gap-3 px-5 py-4">
          <Bell size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800">알림 설정</span>
          <button
            onClick={() => setNotifEnabled((v) => !v)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200',
              notifEnabled ? 'bg-primary' : 'bg-neutral-200',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200',
                notifEnabled ? 'left-[22px]' : 'left-0.5',
              )}
            />
          </button>
        </div>

        {/* 언어 설정 */}
        <button
          onClick={() => setShowLangSheet(true)}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <Globe size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-left">언어 설정</span>
          <span className="text-xs text-neutral-400 mr-1">{language === 'ko' ? '한국어' : 'English'}</span>
          <ChevronRight size={14} className="text-neutral-300" />
        </button>
      </div>

      {/* 정보 */}
      <div className="mt-3 bg-white divide-y divide-neutral-50">
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
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-left">약관 및 정책</span>
          <ChevronRight size={14} className="text-neutral-300" />
        </button>

        <div className="flex items-center gap-3 px-5 py-4">
          <Info size={16} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-sm font-semibold text-neutral-800">버전 정보</span>
          <span className="text-xs text-neutral-400">v1.0.0</span>
        </div>
      </div>

      {/* 계정 */}
      <div className="mt-3 bg-white divide-y divide-neutral-50">
        <button
          onClick={() => {/* 로그아웃 처리 */}}
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

      {/* 언어 선택 시트 */}
      {showLangSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowLangSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 pb-8">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-neutral-200 rounded-full" />
            </div>
            <p className="text-sm font-bold text-neutral-800 px-5 pt-2 pb-4">언어 선택</p>
            {(['ko', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang)
                  setShowLangSheet(false)
                }}
                className={cn(
                  'w-full flex items-center justify-between px-5 py-4 text-sm font-semibold',
                  language === lang ? 'text-primary' : 'text-neutral-700',
                )}
              >
                <span>{lang === 'ko' ? '한국어' : 'English'}</span>
                {language === lang && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* 탈퇴 확인 모달 */}
      {showWithdrawConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowWithdrawConfirm(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6">
              <p className="text-base font-bold text-neutral-900 mb-2">정말 탈퇴할까요?</p>
              <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                탈퇴 시 작성한 게시글과 댓글이 모두 삭제되며 복구할 수 없어요.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdrawConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-neutral-100 text-sm font-bold text-neutral-600"
                >
                  취소
                </button>
                <button
                  onClick={() => {/* 탈퇴 처리 */}}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-sm font-bold text-white"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
