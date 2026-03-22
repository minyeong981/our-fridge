import { Bell, Settings } from 'lucide-react'

interface FridgeListHeaderProps {
  readonly onNotification?: () => void
  readonly onSettings?: () => void
}

export function FridgeListHeader({ onNotification, onSettings }: FridgeListHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
      <h1 className="font-bold text-lg text-neutral-800">우리의 냉장고</h1>

      <div className="flex items-center gap-1">
        <button
          onClick={onNotification}
          aria-label="알림"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <Bell size={20} className="text-neutral-500" />
        </button>
        <button
          onClick={onSettings}
          aria-label="설정"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <Settings size={18} className="text-neutral-500" />
        </button>
      </div>
    </header>
  )
}
