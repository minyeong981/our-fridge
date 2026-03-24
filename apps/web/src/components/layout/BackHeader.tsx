'use client'

import { ChevronLeft, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackHeaderProps {
  title: string
}

export function BackHeader({ title }: BackHeaderProps) {
  const router = useRouter()

  return (
    <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
      <button
        onClick={() => router.back()}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
      >
        <ChevronLeft size={22} className="text-neutral-700" />
      </button>
      <h1 className="font-bold text-base text-neutral-800">{title}</h1>
      <button
        aria-label="알림"
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
      >
        <Bell size={20} className="text-neutral-500" />
      </button>
    </header>
  )
}
