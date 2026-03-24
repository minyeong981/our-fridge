'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  onDone: () => void
  duration?: number
}

export function Toast({ message, onDone, duration = 2000 }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 마운트 후 fade-in
    const show = setTimeout(() => setVisible(true), 10)
    // fade-out 후 제거
    const hide = setTimeout(() => setVisible(false), duration - 300)
    const done = setTimeout(onDone, duration)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
      clearTimeout(done)
    }
  }, [duration, onDone])

  return (
    <div
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-[95]',
        'bg-neutral-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg',
        'transition-opacity duration-300 whitespace-nowrap',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      {message}
    </div>
  )
}
