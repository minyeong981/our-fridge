'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FridgeCard } from '@/components/fridge-list/FridgeCard'
import { FridgeFormPanel } from '@/components/fridges/FridgeFormPanel'
import { useAuth } from '@/contexts/AuthContext'
import { getUserFridges } from '@our-fridge/api'

export default function FridgesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const { data: fridges = [], isLoading } = useQuery({
    queryKey: ['user-fridges', user?.id],
    queryFn: () => getUserFridges(user!.id),
    enabled: !!user,
  })

  const fridgeCards = fridges.map((fridge) => ({
    id: fridge.id,
    emoji: fridge.emoji,
    name: fridge.name,
    role: fridge.role,
    memberCount: fridge.memberCount,
    itemCount: fridge.itemCount,
  }))

  const isEmpty = !isLoading && fridgeCards.length === 0

  if (authLoading || isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full bg-neutral-50 flex flex-col overflow-hidden">
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center pb-16">
          <div className="text-5xl">🧊</div>
          <div>
            <p className="font-bold text-neutral-700 text-base">아직 냉장고가 없어요</p>
            <p className="text-sm text-neutral-400 mt-1 mb-3">
              냉장고를 추가하고 음식을
              <br />
              함께 관리해보세요
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full font-semibold text-sm shadow-sm shadow-primary/30"
          >
            <Plus size={16} strokeWidth={2.5} />
            냉장고 추가하기
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-lg mx-auto w-full px-4 py-5 pb-20 flex flex-col gap-3">
            {fridgeCards.map((fridge) => (
              <FridgeCard
                key={fridge.id}
                id={fridge.id}
                emoji={fridge.emoji}
                name={fridge.name}
                role={fridge.role}
                memberCount={fridge.memberCount}
                itemCount={fridge.itemCount}
                updatedAt=""
              />
            ))}
          </div>
        </div>
      )}

      {!isEmpty && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-7 right-4 flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 font-semibold text-sm z-40"
        >
          <Plus size={18} strokeWidth={2.5} />
          냉장고 추가
        </button>
      )}

      <FridgeFormPanel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['user-fridges', user?.id] })}
      />
    </div>
  )
}
