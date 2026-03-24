import Link from 'next/link'
import { ChevronRight, Users, ShoppingBasket } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FridgeRole = 'owner' | 'admin' | 'member'

export interface FridgeCardProps {
  id: string
  name: string
  emoji: string
  role: FridgeRole
  memberCount: number
  itemCount: number
  updatedAt: string
  onClick?: () => void
}

const roleLabel: Record<FridgeRole, string> = {
  owner: '관리자',
  admin: '관리자',
  member: '멤버',
}

const roleBadgeClass: Record<FridgeRole, string> = {
  owner: 'bg-secondary-100 text-secondary-600',
  admin: 'bg-secondary-100 text-secondary-600',
  member: 'bg-primary-100 text-primary-600',
}

export function FridgeCard({
  id,
  name,
  emoji,
  role,
  memberCount,
  itemCount,
  updatedAt,
  onClick,
}: FridgeCardProps) {
  return (
    <Link
      href={`/fridges/${id}`}
      onClick={onClick}
      className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 shadow-sm border border-neutral-100 hover:bg-neutral-50 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl shrink-0">
        {emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', roleBadgeClass[role])}
          >
            {roleLabel[role]}
          </span>
        </div>
        <p className="font-bold text-neutral-800 text-sm leading-tight truncate">{name}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Users size={11} />
            멤버 {memberCount}명
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBasket size={11} />
            음식 {itemCount}개
          </span>
          <span>{updatedAt}</span>
        </div>
      </div>

      <ChevronRight size={18} className="text-neutral-300 shrink-0" />
    </Link>
  )
}
