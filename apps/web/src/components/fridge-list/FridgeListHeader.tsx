import { Bell } from 'lucide-react'

export function FridgeListHeader({
  onNotification,
  title = '우리의 냉장고',
}: {
  readonly onNotification?: () => void
  readonly title?: string
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
      <h1 className="font-bold text-lg text-neutral-800">{title}</h1>
      <button
        onClick={onNotification}
        aria-label="알림"
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
      >
        <Bell size={20} className="text-neutral-500" />
      </button>
    </header>
  )
}
