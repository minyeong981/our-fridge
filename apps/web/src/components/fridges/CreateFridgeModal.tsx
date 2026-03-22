'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormField } from '@/components/ui/FormField'
import { PrimaryButton } from '@/components/ui/PrimaryButton'

const EMOJI_OPTIONS = ['🧊', '🏠', '🏢', '🥬', '🍊', '🌿', '⭐', '🏖️', '🍕', '❤️']

interface CreateFridgeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateFridgeModal({ isOpen, onClose }: CreateFridgeModalProps) {
  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🧊')
  const [location, setLocation] = useState('')
  const [memo, setMemo] = useState('')
  const [rules, setRules] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    // TODO: API 연동
    onClose()
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
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
          <h2 className="font-bold text-base text-neutral-800">냉장고 추가하기</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4 pb-8 max-h-[70vh] overflow-y-auto">
          {/* 아이콘 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-700">냉장고 아이콘</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={cn(
                    'w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all',
                    selectedEmoji === emoji
                      ? 'bg-primary-100 ring-2 ring-primary'
                      : 'bg-neutral-100 hover:bg-neutral-200',
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <FormField
            label="냉장고 이름"
            maxLength={20}
            value={name}
            onChange={setName}
            placeholder="예) 거실 냉장고, 김치 냉장고"
            variant="muted"
          />

          <FormField
            label="위치"
            optional
            maxLength={30}
            value={location}
            onChange={setLocation}
            placeholder="예) 주방, 창고, 402호"
            variant="muted"
          />

          <FormField
            label="메모"
            optional
            maxLength={100}
            value={memo}
            onChange={setMemo}
            placeholder="이 냉장고에 대한 설명을 적어주세요"
            as="textarea"
            rows={2}
            variant="muted"
          />

          <FormField
            label="규칙"
            optional
            maxLength={200}
            value={rules}
            onChange={setRules}
            placeholder="예) 개인 음식엔 꼭 이름을 써주세요. 매달 마지막 날은 냉장고 청소합니다."
            as="textarea"
            rows={2}
            variant="muted"
          />

          <PrimaryButton onClick={handleSubmit} disabled={!name.trim()}>
            냉장고 추가하기
          </PrimaryButton>
        </div>
      </div>
    </>
  )
}
