'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FormField } from '@/components/ui/FormField'
import { PrimaryButton } from '@/components/ui/PrimaryButton'

type StorageType = '냉장' | '냉동'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function CalendarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value + 'T00:00:00') : new Date()))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const getDays = (): (number | null)[] => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }

  const today = new Date()
  const selectedDate = value ? new Date(value + 'T00:00:00') : null

  const isInViewMonth =
    !!selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const isSelected = (day: number) => isInViewMonth && selectedDate!.getDate() === day

  const selectDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(dateStr)
    setIsOpen(false)
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const formattedDate = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'w-full px-4 py-3 bg-white border rounded-xl text-sm text-left transition',
          isOpen ? 'border-primary ring-2 ring-primary/10' : 'border-neutral-200',
          formattedDate ? 'text-neutral-800' : 'text-neutral-400',
        )}
      >
        {formattedDate ?? '날짜를 선택하세요'}
      </button>

      {isOpen && (
        <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
            >
              <ChevronLeft size={16} className="text-neutral-500" />
            </button>
            <span className="text-sm font-bold text-neutral-800">
              {year}년 {month + 1}월
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
            >
              <ChevronRight size={16} className="text-neutral-500" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  'text-center text-xs font-semibold py-1',
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-neutral-400',
                )}
              >
                {d}
              </div>
            ))}
          </div>

          <div key={`${year}-${month}`} className="grid grid-cols-7">
            {getDays().map((day, i) => (
              <div key={`${year}-${month}-${i}`} className="flex items-center justify-center py-0.5">
                {day !== null ? (
                  <button
                    onClick={() => selectDay(day)}
                    className={cn(
                      'w-9 h-9 rounded-full text-sm font-medium transition-colors',
                      isSelected(day)
                        ? 'bg-primary text-white font-bold'
                        : isToday(day)
                          ? 'ring-2 ring-primary text-primary font-bold'
                          : i % 7 === 0
                            ? 'text-red-400 hover:bg-red-50'
                            : i % 7 === 6
                              ? 'text-blue-400 hover:bg-blue-50'
                              : 'text-neutral-700 hover:bg-neutral-100',
                    )}
                  >
                    {day}
                  </button>
                ) : (
                  <div className="w-9 h-9" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AddItemPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [storage, setStorage] = useState<StorageType>('냉장')
  const [locationText, setLocationText] = useState('')
  const [memo, setMemo] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    // TODO: API 연동
    router.back()
  }

  return (
    <div className="h-full bg-neutral-50 flex flex-col">
      {/* 폼 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
          <FormField
            label="식재료 이름"
            maxLength={20}
            value={name}
            onChange={setName}
            placeholder="예: 유기농 시금치"
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
            label="세부 위치"
            maxLength={30}
            value={locationText}
            onChange={setLocationText}
            placeholder="예: 두 번째 칸 구석"
          />

          {/* 사진 등록 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-700">
              사진 <span className="text-neutral-400 font-normal">(선택)</span>
            </label>
            <button className="w-full h-24 bg-white border border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:bg-neutral-50 transition-colors">
              <Camera size={22} className="text-neutral-400" />
              <span className="text-xs text-neutral-400 font-medium">사진 추가</span>
            </button>
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
              냉장고에 넣기
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}
