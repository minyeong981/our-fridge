'use client'

import { User, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Member {
  id: string
  name: string
  avatarUrl?: string | null
  role: '관리자' | '멤버'
  isMe?: boolean
}

interface MemberSheetProps {
  isOpen: boolean
  onClose: () => void
  members: Member[]
}

export function MemberSheet({ isOpen, onClose, members }: MemberSheetProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl max-w-lg mx-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <h2 className="font-bold text-base text-neutral-800">멤버 {members.length}명</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>
        <ul className="px-4 py-3 pb-8 flex flex-col divide-y divide-neutral-50">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              {m.avatarUrl ? (
                <img
                  src={m.avatarUrl}
                  alt={m.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <User size={18} className="text-neutral-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-800">
                  {m.name}
                  {m.isMe && <span className="text-xs text-neutral-400 ml-1">(나)</span>}
                </p>
              </div>
              <span
                className={cn(
                  'text-xs font-semibold px-2.5 py-1 rounded-full',
                  m.role === '관리자'
                    ? 'bg-secondary-100 text-secondary-600'
                    : 'bg-primary-100 text-primary-600',
                )}
              >
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
