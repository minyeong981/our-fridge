import { Plus } from 'lucide-react'

interface NewSpaceButtonProps {
  onClick?: () => void
}

export function NewSpaceButton({ onClick }: NewSpaceButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-center gap-2 py-5 border-2 border-dashed border-primary-200 rounded-2xl text-primary hover:bg-primary-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <Plus size={20} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="text-sm font-semibold text-primary-600">새 공간 만들기</span>
      <span className="text-xs text-neutral-400">공간을 만들어 냉장고를 관리해보세요</span>
    </button>
  )
}
