'use client'

import { cn } from '@/lib/utils'

interface PrimaryButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function PrimaryButton({ onClick, disabled, children, className }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-center py-4 bg-primary text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-primary/25',
        'disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  )
}
