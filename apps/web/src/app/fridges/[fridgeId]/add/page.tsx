'use client'

import { Suspense, useState } from 'react'
import { Camera } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FormField } from '@/components/ui/FormField'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { CalendarPicker } from '@/components/ui/CalendarPicker'

type StorageType = '냉장' | '냉동'

// TODO: API 연동 시 제거
const MOCK_ITEMS: Record<
  string,
  { name: string; expiresAt: string; storage: StorageType; locationText: string; memo: string }
> = {
  i1: {
    name: '싱싱한 양상추',
    expiresAt: '2024-06-28',
    storage: '냉장',
    locationText: '도어 포켓',
    memo: '샌드위치용으로 구매함.',
  },
}

function AddItemContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')
  const isEditMode = !!itemId
  const prefill = itemId ? MOCK_ITEMS[itemId] : null

  const [name, setName] = useState(prefill?.name ?? '')
  const [expiresAt, setExpiresAt] = useState(prefill?.expiresAt ?? '')
  const [storage, setStorage] = useState<StorageType>(prefill?.storage ?? '냉장')
  const [locationText, setLocationText] = useState(prefill?.locationText ?? '')
  const [memo, setMemo] = useState(prefill?.memo ?? '')

  const handleSubmit = () => {
    if (!name.trim()) return
    // TODO: API 연동 (isEditMode ? update : create)
    router.back()
  }

  return (
    <div className="h-full bg-neutral-50 flex flex-col">
      {/* 폼 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
          {/* 사진 등록 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-700">사진</label>
            <button className="w-full h-72 bg-white border border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:bg-neutral-50 transition-colors">
              <Camera size={22} className="text-neutral-400" />
              <span className="text-xs text-neutral-400 font-medium">사진 추가</span>
            </button>
          </div>
          <FormField
            label="이름"
            maxLength={20}
            value={name}
            onChange={setName}
            placeholder="예: 엄마표 김치찜"
          />

          {/* 소비기한 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-700">소비기한 / 유통기한</label>
            <CalendarPicker value={expiresAt} onChange={setExpiresAt} />
          </div>

          {/* 보관 방식 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-700">보관 방식</label>
            <div className="flex gap-2">
              {(['냉장', '냉동'] as StorageType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStorage(s)
                    setLocationText('')
                  }}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                    storage === s
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-500 border border-neutral-200',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <FormField
            label="메모"
            optional
            maxLength={100}
            value={memo}
            onChange={setMemo}
            placeholder="기억해야 할 내용이 있나요? (예: 이번 주 안에 먹기)"
            as="textarea"
            rows={3}
          />

          {/* 저장 버튼 */}
          <div className="pb-24 pt-1">
            <PrimaryButton
              onClick={handleSubmit}
              disabled={!name.trim() || !expiresAt || !locationText.trim()}
            >
              {isEditMode ? '수정하기' : '냉장고에 넣기'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AddItemPage() {
  return (
    <Suspense>
      <AddItemContent />
    </Suspense>
  )
}
