'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarPicker({
  value,
  onChange,
  minDate,
}: {
  value: string
  onChange: (v: string) => void
  minDate?: Date
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(value + 'T00:00:00') : new Date(),
  )

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
    !!selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const isSelected = (day: number) => isInViewMonth && selectedDate!.getDate() === day

  const isBeforeMin = (day: number) => {
    if (!minDate) return false
    const d = new Date(year, month, day)
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
    return d < min
  }

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
                    onClick={() => !isBeforeMin(day) && selectDay(day)}
                    disabled={isBeforeMin(day)}
                    className={cn(
                      'w-9 h-9 rounded-full text-sm font-medium transition-colors',
                      isBeforeMin(day)
                        ? 'text-neutral-300 cursor-not-allowed'
                        : isSelected(day)
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
