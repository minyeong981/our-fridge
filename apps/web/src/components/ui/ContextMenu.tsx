'use client'

import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  label: string
  onClick: () => void
  danger?: boolean
}

interface ContextMenuProps {
  menuId: string
  openMenuId: string | null
  onOpenChange: (id: string | null) => void
  items: MenuItem[]
  iconSize?: number
  iconClassName?: string
}

export function ContextMenu({
  menuId,
  openMenuId,
  onOpenChange,
  items,
  iconSize = 14,
  iconClassName = 'text-neutral-400',
}: ContextMenuProps) {
  const isOpen = openMenuId === menuId

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onOpenChange(isOpen ? null : menuId)
        }}
        className="p-1 rounded hover:bg-neutral-100 transition-colors"
      >
        <MoreVertical size={iconSize} className={iconClassName} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(null)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-50 w-24">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onOpenChange(null)
                  item.onClick()
                }}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-xs font-semibold',
                  item.danger
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-neutral-700 hover:bg-neutral-50',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
