import { NotificationBell } from '@/components/layout/NotificationBell'

export function FridgeListHeader({ title = '우리의 냉장고' }: { readonly title?: string }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
      <div className="flex items-center gap-2">
        {title === '우리의 냉장고' && (
          <img src="/our-fridge-icon.png" alt="" className="w-7 h-7 rounded-lg" />
        )}
        <h1 className="font-bold text-lg text-neutral-800">{title}</h1>
      </div>
      <NotificationBell />
    </header>
  )
}
