'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trash2, Refrigerator } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { FormField } from '@/components/ui/FormField'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useAuth } from '@/contexts/AuthContext'
import { createFridge, updateFridge, addMember } from '@our-fridge/api'

const EMOJI_OPTIONS = ['🧊', '🏠', '🏢', '🥬', '🍊', '🌿', '⭐', '🏖️', '🍕', '❤️', '🍱']

const MAX_NAME_LENGTH = 20
const MAX_LOCATION_LENGTH = 20
const MAX_MEMO_LENGTH = 30
const MAX_RULES_LENGTH = 200
const MEMO_ROWS = 2
const RULES_ROWS = 6

interface FridgeFormData {
  emoji: string | null
  name: string
  location: string
  memo: string
  rules: string
}

interface FridgeFormPanelProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSuccess?: () => void
  readonly initialData?: FridgeFormData
  readonly fridgeId?: string
  readonly onDelete?: () => void
}

export function FridgeFormPanel({ isOpen, onClose, onSuccess, initialData, fridgeId, onDelete }: FridgeFormPanelProps) {
  const isEditMode = !!initialData
  const { user } = useAuth()
  const router = useRouter()
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(initialData?.emoji ?? null)
  const [name, setName] = useState(initialData?.name ?? '')
  const [location, setLocation] = useState(initialData?.location ?? '')
  const [memo, setMemo] = useState(initialData?.memo ?? '')
  const [rules, setRules] = useState(initialData?.rules ?? '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('로그인이 필요해요')
      if (isEditMode && fridgeId) {
        return updateFridge(fridgeId, {
          name: name.trim(),
          emoji: selectedEmoji,
          location: location.trim() || null,
          description: memo.trim() || null,
          rules: rules.trim() || null,
        })
      }
      const fridge = await createFridge({
        name: name.trim(),
        emoji: selectedEmoji,
        location: location.trim() || null,
        description: memo.trim() || null,
        rules: rules.trim() || null,
      })
      await addMember(fridge.id, user.id, 'owner')
      return fridge
    },
    onSuccess: () => {
      onSuccess?.()
      onClose()
      if (!isEditMode) router.push('/fridges')
    },
  })

  if (!isOpen) return null

  const saveLabel = isPending ? '저장 중...' : isEditMode ? '저장' : '추가'

  const handleSave = () => {
    if (!name.trim() || isPending) return
    save()
  }

  return (
    <div className="fixed inset-0 bg-white z-[202] flex flex-col">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>
        <h1 className="font-bold text-base text-neutral-800">
          {isEditMode ? '냉장고 설정' : '냉장고 추가하기'}
        </h1>
        <button
          onClick={handleSave}
          disabled={!name.trim() || isPending}
          className="text-sm font-bold text-primary disabled:text-neutral-300 transition-colors"
        >
          {saveLabel}
        </button>
      </div>

      {/* 내용 */}
      <div className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm px-5 py-5 flex flex-col gap-4">
          {/* 아이콘 */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-neutral-700">냉장고 아이콘</p>
            <div className="grid grid-cols-6 gap-2">
              {/* 선택 안 함 */}
              <button
                onClick={() => setSelectedEmoji(null)}
                className={cn(
                  'aspect-square rounded-xl flex items-center justify-center transition-all',
                  selectedEmoji === null
                    ? 'bg-primary-100 ring-2 ring-primary'
                    : 'bg-neutral-100 hover:bg-neutral-200',
                )}
              >
                <Refrigerator size={20} className={selectedEmoji === null ? 'text-primary' : 'text-neutral-400'} />
              </button>
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={cn(
                    'aspect-square rounded-xl text-2xl flex items-center justify-center transition-all',
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
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={setName}
            placeholder="예) 거실 냉장고, 김치 냉장고"
            variant="muted"
          />

          <FormField
            label="위치"
            optional
            maxLength={MAX_LOCATION_LENGTH}
            value={location}
            onChange={setLocation}
            placeholder="예) OO 기숙사, 창고, 402호"
            variant="muted"
          />

          <FormField
            label="메모"
            optional
            maxLength={MAX_MEMO_LENGTH}
            value={memo}
            onChange={setMemo}
            placeholder="이 냉장고에 대한 설명을 적어주세요"
            as="textarea"
            rows={MEMO_ROWS}
            variant="muted"
          />

          <FormField
            label="규칙"
            optional
            maxLength={MAX_RULES_LENGTH}
            value={rules}
            onChange={setRules}
            placeholder="예) 보관 가능 물품: 반찬, 간식 / 보관 불가능 물품: 생선

            참고: 매달 마지막 날은 냉장고 청소합니다."
            as="textarea"
            rows={RULES_ROWS}
            variant="muted"
          />
        </div>

        {isEditMode && onDelete && (
          <div className="mx-4 mt-6 bg-white rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-red-400 active:bg-red-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 size={16} className="text-red-400" />
              </div>
              냉장고 삭제
            </button>
          </div>
        )}

        <div className="h-8" />
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="냉장고를 삭제할까요?"
        description="냉장고와 모든 식재료 데이터가 삭제되며 복구할 수 없어요."
        confirmLabel="삭제하기"
        onConfirm={() => {
          setShowDeleteConfirm(false)
          onDelete?.()
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive
      />
    </div>
  )
}
