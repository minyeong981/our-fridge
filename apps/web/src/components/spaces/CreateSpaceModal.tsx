'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMOJI_OPTIONS = ['🏠', '🏢', '❤️', '🍊', '🌿', '⭐', '🏖️', '🍕']

interface CreateSpaceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateSpaceModal({ isOpen, onClose }: CreateSpaceModalProps) {
  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🏠')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name.trim()) return
    // TODO: API 연동
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl max-w-lg mx-auto">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <h2 className="font-bold text-base text-neutral-800">내 공간 만들기</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5 pb-8">
          {/* 공간 이름 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-700">공간 이름</label>
            <input
              type="text"
              placeholder="예) 우리집 냉장고, 자취방 펜트리"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>

          {/* 공간 아이콘 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-700">공간 아이콘</label>
              <span className="text-xs font-semibold text-primary">PICK ONE</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={cn(
                    'w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all',
                    selectedEmoji === emoji
                      ? 'bg-primary-100 ring-2 ring-primary'
                      : 'bg-neutral-100 hover:bg-neutral-200'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 공간 설명 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-700">
              공간 설명 <span className="text-neutral-400 font-normal">(선택)</span>
            </label>
            <textarea
              placeholder="멤버들과 공유할 메시지를 적어주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none"
            />
          </div>

          {/* 확인 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            공간 만들기
          </button>
        </div>
      </div>
    </>
  )
}
