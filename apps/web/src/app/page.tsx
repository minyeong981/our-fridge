'use client'

import { useEffect, useState } from 'react'
import { getItemsByFridge } from '@our-fridge/api'
import type { Item } from '@our-fridge/shared'
import { formatDate, isExpired, isExpiringSoon } from '@our-fridge/shared'

const FRIDGE_ID = 'your-fridge-id' // 실제 fridge ID로 교체

function getExpireColor(date: string) {
  if (isExpired(date)) return 'text-red-500'
  if (isExpiringSoon(date)) return 'text-orange-400'
  return 'text-gray-400'
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getItemsByFridge(FRIDGE_ID)
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-8">로딩 중...</p>
  if (error) return <p className="p-8 text-red-500">에러: {error}</p>

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">우리의 냉장고</h1>
      {items.length === 0 ? (
        <p className="text-gray-400">냉장고가 비어있습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="py-3">
              <span className="font-medium">{item.name}</span>
              <span className="ml-2 text-sm text-gray-400">{item.ownerName}</span>
              {item.expireDate && (
                <span className={`ml-2 text-sm ${getExpireColor(item.expireDate)}`}>
                  ({formatDate(item.expireDate)})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
