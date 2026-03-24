'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PrimaryButton } from '@/components/ui/PrimaryButton'

interface NoticeModalProps {
  isOpen: boolean
  onClose: () => void
}

const MAX_LENGTH = 300

export function NoticeModal({ isOpen, onClose }: NoticeModalProps) {
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (!content.trim()) return
    // TODO: API 연동
    setContent('')
    onClose()
  }

  const handleClose = () => {
    setContent('')
    onClose()
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={handleClose}
      />

      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl max-w-lg mx-auto transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <h2 className="font-bold text-base text-neutral-800">공지 작성</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4 pb-8">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="멤버들에게 전달할 내용을 입력해주세요"
              rows={5}
              className="w-full resize-none rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className={cn(
              'absolute bottom-3 right-4 text-xs',
              content.length >= MAX_LENGTH ? 'text-red-400' : 'text-neutral-300',
            )}>
              {content.length}/{MAX_LENGTH}
            </span>
          </div>

          <PrimaryButton onClick={handleSubmit} disabled={!content.trim()}>
            공지 올리기
          </PrimaryButton>
        </div>
      </div>
    </>
  )
}
