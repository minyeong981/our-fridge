'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Refrigerator } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { getMyItems } from '@our-fridge/api'
import type { ItemWithFridgeInfo } from '@our-fridge/api'

const today = new Date()
today.setHours(0, 0, 0, 0)
const DAYS_EXPIRY_SOON = 3

function daysLeft(expireDate: string | null): number | null {
  if (!expireDate) return null
  return Math.floor((new Date(expireDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function fmt(d: string) {
  const date = new Date(d)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

type Tab = 'fridge' | 'feed'

export default function MyItemsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('fridge')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['my-items'],
    queryFn: getMyItems,
  })

  // 냉장고별 그룹
  const grouped = items.reduce<Record<string, { fridgeName: string; spaceName: string; items: ItemWithFridgeInfo[] }>>(
    (acc, item) => {
      if (!acc[item.fridgeId]) {
        acc[item.fridgeId] = { fridgeName: item.fridgeName, spaceName: item.spaceName, items: [] }
      }
      acc[item.fridgeId].items.push(item)
      return acc
    },
    {},
  )

  return (
    <div className="h-full bg-neutral-50 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>
        <h1 className="font-bold text-base text-neutral-800">내 음식</h1>
        <div className="w-8" />
      </header>

      {/* 탭 */}
      <div className="shrink-0 flex bg-white border-b border-neutral-100">
        {([['fridge', '냉장고별'], ['feed', '전체']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-colors border-b-2',
              tab === key
                ? 'text-primary border-primary'
                : 'text-neutral-400 border-transparent',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-16">
            <p className="text-5xl">🧊</p>
            <p className="text-base font-semibold text-neutral-500">등록한 음식이 없어요</p>
          </div>
        ) : tab === 'fridge' ? (
          <div className="max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-6">
            {Object.entries(grouped).map(([fridgeId, group]) => (
              <div key={fridgeId}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Refrigerator size={14} className="text-neutral-400 shrink-0" />
                  <p className="text-xs font-bold text-neutral-500">
                    {group.spaceName && <span className="text-neutral-400 font-normal">{group.spaceName} · </span>}
                    {group.fridgeName}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onClick={() => router.push(`/fridges/${item.fridgeId}/items/${item.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-2">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                showFridge
                onClick={() => router.push(`/fridges/${item.fridgeId}/items/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ItemCard({
  item,
  showFridge = false,
  onClick,
}: {
  item: ItemWithFridgeInfo
  showFridge?: boolean
  onClick: () => void
}) {
  const days = daysLeft(item.expireDate)
  const isExpired = days !== null && days < 0
  const isExpiringSoon = days !== null && days >= 0 && days <= DAYS_EXPIRY_SOON

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-neutral-100 shadow-sm cursor-pointer active:bg-neutral-50 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 overflow-hidden">
        {item.imageUrls[0] ? (
          <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">🧊</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-neutral-800 truncate">{item.name}</p>
        {item.expireDate ? (
          <p className={cn(
            'text-xs mt-0.5',
            isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-500' : 'text-neutral-400',
          )}>
            {fmt(item.expireDate)}
            {days !== null && (
              <span className="ml-1.5 opacity-70">
                {isExpired ? `(${Math.abs(days)}일 초과)` : `(D-${days})`}
              </span>
            )}
          </p>
        ) : (
          <p className="text-xs text-neutral-300 mt-0.5">소비기한 없음</p>
        )}
        {showFridge && (
          <p className="text-[11px] text-neutral-300 mt-0.5">{item.fridgeName}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-[11px] text-neutral-300">{item.storageType}</span>
        {isExpired && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">기한 초과</span>
        )}
        {!isExpired && isExpiringSoon && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">만료 임박</span>
        )}
      </div>
    </div>
  )
}
