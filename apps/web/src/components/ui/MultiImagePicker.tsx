'use client'

import { useRef, useState, useEffect } from 'react'
import { Camera, ImageIcon, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiImagePickerProps {
  readonly photos: string[]
  readonly max?: number
  readonly isUploading?: boolean
  readonly label?: string
  readonly required?: boolean
  readonly onRemove: (index: number) => void
  readonly onFileChange: (file: File) => void
  readonly onRNPick: (source: 'camera' | 'gallery') => void
}

export function MultiImagePicker({
  photos,
  max = 3,
  isUploading = false,
  label,
  required = false,
  onRemove,
  onFileChange,
  onRNPick,
}: MultiImagePickerProps) {
  const [isRN, setIsRN] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsRN(!!(window as any).ReactNativeWebView)
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    onFileChange(file)
  }

  const canAdd = photos.length < max

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-neutral-700">
          {label}
          {required && <span className="ml-1 text-xs font-normal text-red-400">*</span>}
          <span className="ml-1 text-xs font-normal text-neutral-400">
            ({photos.length}/{max})
          </span>
        </label>
      )}
      <div className="flex gap-2 flex-wrap">
        {photos.map((src, i) => (
          <div key={i} className="relative w-24 h-24 shrink-0">
            {src ? (
              <img src={src} alt={`사진 ${i + 1}`} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <div className="w-full h-full rounded-xl bg-neutral-100 flex items-center justify-center">
                <Camera size={20} className="text-neutral-300 animate-pulse" />
              </div>
            )}
            <button
              type="button"
              onClick={() => onRemove(i)}
              disabled={isUploading}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-800 rounded-full flex items-center justify-center disabled:opacity-50"
            >
              <X size={11} className="text-white" />
            </button>
          </div>
        ))}

        {canAdd && (
          isRN ? (
            <>
              <button
                type="button"
                onClick={() => onRNPick('camera')}
                disabled={isUploading}
                className="w-24 h-24 rounded-xl bg-white border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <Camera size={20} className={cn('text-neutral-400', isUploading && 'animate-pulse')} />
                <span className="text-xs text-neutral-400">카메라</span>
              </button>
              <button
                type="button"
                onClick={() => onRNPick('gallery')}
                disabled={isUploading}
                className="w-24 h-24 rounded-xl bg-white border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <ImageIcon size={20} className="text-neutral-400" />
                <span className="text-xs text-neutral-400">갤러리</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-24 h-24 rounded-xl bg-white border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <Plus size={20} className={cn('text-neutral-400', isUploading && 'animate-pulse')} />
              <span className="text-xs text-neutral-400">
                {isUploading ? '업로드 중...' : '사진 추가'}
              </span>
            </button>
          )
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  )
}
