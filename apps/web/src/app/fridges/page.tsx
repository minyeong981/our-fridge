'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { FridgeCard, FridgeCardProps } from '@/components/fridge-list/FridgeCard'
import { CreateFridgeModal } from '@/components/fridges/CreateFridgeModal'

const MOCK_FRIDGES: FridgeCardProps[] = [
  {
    id: '1',
    name: '우리집 냉장고',
    emoji: '🏠',
    role: 'owner',
    memberCount: 4,
    itemCount: 12,
    updatedAt: '조금 전',
  },
  {
    id: '2',
    name: '사무실 냉장고',
    emoji: '🏢',
    role: 'admin',
    memberCount: 12,
    itemCount: 5,
    updatedAt: '1시간 전',
  },
  {
    id: '3',
    name: '여름 별장 펜트리',
    emoji: '🏖️',
    role: 'member',
    memberCount: 3,
    itemCount: 8,
    updatedAt: '3일 전',
  },
]

export default function FridgesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isEmpty = MOCK_FRIDGES.length === 0

  return (
    <div className="h-full bg-neutral-50 flex flex-col overflow-hidden">
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center pb-16">
          <div className="text-5xl">🧊</div>
          <div>
            <p className="font-bold text-neutral-700 text-base">아직 냉장고가 없어요</p>
            <p className="text-sm text-neutral-400 mt-1 mb-3">
              냉장고를 추가하고 식재료를
              <br />
              함께 관리해보세요
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-semibold text-sm shadow-sm shadow-primary/30"
          >
            <Plus size={16} strokeWidth={2.5} />
            냉장고 추가하기
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-lg mx-auto w-full px-4 py-5 pb-24 flex flex-col gap-3">
            {MOCK_FRIDGES.map((fridge) => (
              <FridgeCard key={fridge.id} {...fridge} />
            ))}
          </div>
        </div>
      )}

      {!isEmpty && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-20 right-4 flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 font-semibold text-sm z-40"
        >
          <Plus size={18} strokeWidth={2.5} />
          냉장고 추가
        </button>
      )}

      <CreateFridgeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
