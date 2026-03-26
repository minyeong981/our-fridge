'use client'

import {
  ChevronLeft,
  Bell,
  BellOff,
  CalendarClock,
  Megaphone,
  UserPlus,
  MessageSquare,
  Reply,
  Heart,
  Gift,
  ShieldAlert,
} from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'
import type { NotifSettings } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'

interface ToggleRowProps {
  icon: React.ReactNode
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function ToggleRow({ icon, label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'w-full flex items-center gap-4 px-5 py-4 text-left transition-colors',
        disabled ? 'opacity-35' : 'active:bg-neutral-50',
      )}
    >
      <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800">{label}</p>
        {description && (
          <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
          checked && !disabled ? 'bg-primary' : 'bg-neutral-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200',
            checked && !disabled ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </div>
    </button>
  )
}

function SectionLabel({ title }: { title: string }) {
  return (
    <p className="px-5 pt-5 pb-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
      {title}
    </p>
  )
}

function postToRN(data: object) {
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    ;(window as any).ReactNativeWebView.postMessage(JSON.stringify(data))
  }
}

export function NotificationSettings() {
  const { isSettingsOpen, closeSettings, settings, updateSettings } = useNotification()

  if (!isSettingsOpen) return null

  const { master } = settings
  const off = !master

  function toggle(key: keyof NotifSettings) {
    updateSettings({ [key]: !settings[key] })
  }

  return (
    <div className="fixed inset-0 bg-white z-[202] flex flex-col">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <button
          onClick={closeSettings}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>
        <h1 className="font-bold text-base text-neutral-800">알림 설정</h1>
        <div className="w-8" />
      </div>

      {/* 내용 */}
      <div className="flex-1 overflow-y-auto bg-neutral-50">
        {/* 전체 알림 마스터 토글 */}
        <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggle('master')}
            className="w-full flex items-center gap-4 px-5 py-5 active:bg-neutral-50 transition-colors"
          >
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200',
                settings.master ? 'bg-primary-100' : 'bg-neutral-100',
              )}
            >
              {settings.master ? (
                <Bell size={20} className="text-primary" />
              ) : (
                <BellOff size={20} className="text-neutral-400" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-neutral-900">전체 알림</p>
              <p className={cn('text-xs mt-0.5', settings.master ? 'text-primary' : 'text-neutral-400')}>
                {settings.master ? '알림을 받고 있어요' : '모든 알림이 꺼져 있어요'}
              </p>
            </div>
            <div
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0',
                settings.master ? 'bg-primary' : 'bg-neutral-200',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200',
                  settings.master ? 'left-[26px]' : 'left-1',
                )}
              />
            </div>
          </button>
        </div>

        {off && (
          <div className="mx-4 mt-2 px-4 py-3 bg-neutral-100 rounded-xl">
            <p className="text-xs text-neutral-500 text-center leading-relaxed">
              전체 알림이 꺼져 있어요. 아래 설정은 알림을 다시 켰을 때 적용돼요.
            </p>
          </div>
        )}

        <SectionLabel title="냉장고" />
        <div className="mx-4 bg-white rounded-2xl overflow-hidden shadow-sm divide-y ">
          <ToggleRow
            icon={<CalendarClock size={18} className="text-amber-500" />}
            label="유통기한 임박"
            description="만료 3일 전부터 알려드려요"
            checked={settings.fridgeExpiry}
            onChange={() => toggle('fridgeExpiry')}
            disabled={off}
          />
          <ToggleRow
            icon={<Megaphone size={18} className="text-primary" />}
            label="규칙 · 공지 변경"
            description="냉장고 규칙이나 공지가 바뀌면 알려드려요"
            checked={settings.fridgeNotice}
            onChange={() => toggle('fridgeNotice')}
            disabled={off}
          />
          <ToggleRow
            icon={<UserPlus size={18} className="text-green-500" />}
            label="새 멤버 합류"
            description="새로운 멤버가 초대받으면 알려드려요"
            checked={settings.fridgeInvite}
            onChange={() => toggle('fridgeInvite')}
            disabled={off}
          />
        </div>

        <SectionLabel title="커뮤니티" />
        <div className="mx-4 bg-white rounded-2xl overflow-hidden shadow-sm divide-y ">
          <ToggleRow
            icon={<MessageSquare size={18} className="text-blue-500" />}
            label="내 게시글 댓글 · 답글"
            description="내가 쓴 게시글에 댓글이 달리면 알려드려요"
            checked={settings.communityMyPostComment}
            onChange={() => toggle('communityMyPostComment')}
            disabled={off}
          />
          <ToggleRow
            icon={<Reply size={18} className="text-violet-500" />}
            label="내 댓글 · 답글"
            description="내가 단 댓글에 답글이 달리면 알려드려요"
            checked={settings.communityMyComment}
            onChange={() => toggle('communityMyComment')}
            disabled={off}
          />
          <ToggleRow
            icon={<Heart size={18} className="text-rose-400" />}
            label="좋아요 누른 게시글"
            description="관심 표시한 게시글에 새 댓글이 달리면 알려드려요"
            checked={settings.communityLikedPost}
            onChange={() => toggle('communityLikedPost')}
            disabled={off}
          />
          <ToggleRow
            icon={<Gift size={18} className="text-secondary" />}
            label="나눔"
            description="나눔 게시글 관련 알림을 받아요"
            checked={settings.communityShare}
            onChange={() => toggle('communityShare')}
            disabled={off}
          />
          <ToggleRow
            icon={<ShieldAlert size={18} className="text-neutral-400" />}
            label="신고 결과"
            description="신고한 콘텐츠의 처리 결과를 알려드려요"
            checked={settings.communityReport}
            onChange={() => toggle('communityReport')}
            disabled={off}
          />
        </div>

        <div className="mx-4 mt-6 mb-2">
          <button
            onClick={() => postToRN({ type: 'test_notification' })}
            className="w-full py-3.5 rounded-2xl border border-neutral-200 text-sm font-semibold text-neutral-500 active:bg-neutral-50 transition-colors"
          >
            테스트 알림 보내기
          </button>
          <p className="text-[11px] text-neutral-400 text-center mt-2">
            3초 후 테스트 알림이 발송돼요
          </p>
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}
