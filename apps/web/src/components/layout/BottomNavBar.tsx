'use client'

import { Refrigerator, Newspaper, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavTab = 'fridge' | 'community' | 'my'

interface NavItem {
  id: NavTab
  icon: React.ElementType
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'fridge',    icon: Refrigerator, label: '냉장고'   },
  { id: 'community', icon: Newspaper,    label: '커뮤니티' },
  { id: 'my',        icon: User,         label: '마이'     },
]

interface BottomNavBarProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100">
      <div className="max-w-lg mx-auto flex items-end h-16 px-2">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </div>
    </nav>
  )
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      aria-label={item.label}
      className="flex flex-col items-center justify-end gap-1 flex-1 pb-2 transition-colors"
    >
      <Icon
        size={22}
        strokeWidth={active ? 2.5 : 1.8}
        className={cn(active ? 'text-primary' : 'text-neutral-400')}
      />
      <span
        className={cn(
          'text-[10px] font-semibold',
          active ? 'text-primary' : 'text-neutral-400'
        )}
      >
        {item.label}
      </span>
    </button>
  )
}
