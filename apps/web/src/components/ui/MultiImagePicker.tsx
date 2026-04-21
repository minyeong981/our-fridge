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
  const [showSheet, setShowSheet] = useState(false)
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

  const handleAddPress = () => {
    if (isRN) {
      setShowSheet(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleRNSelect = (source: 'camera' | 'gallery') => {
    setShowSheet(false)
    onRNPick(source)
  }

  const canAdd = photos.length < max

  return (
    <>
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
            <button
              type="button"
              onClick={handleAddPress}
              disabled={isUploading}
              className="w-24 h-24 rounded-xl bg-white border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <Plus size={20} className={cn('text-neutral-400', isUploading && 'animate-pulse')} />
              <span className="text-xs text-neutral-400">
                {isUploading ? '업로드 중...' : '사진 추가'}
              </span>
            </button>
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

      {/* RN 전용 바텀 시트 */}
      {showSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setShowSheet(false)}
        >
          <div
            className="w-full bg-white rounded-t-2xl pb-8 pt-3 safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-5" />
            <button
              type="button"
              onClick={() => handleRNSelect('camera')}
              className="w-full flex items-center gap-4 px-6 py-4 active:bg-neutral-50 transition-colors"
            >
              <Camera size={20} className="text-neutral-500" />
              <span className="text-sm font-semibold text-neutral-700">카메라로 촬영</span>
            </button>
            <button
              type="button"
              onClick={() => handleRNSelect('gallery')}
              className="w-full flex items-center gap-4 px-6 py-4 active:bg-neutral-50 transition-colors"
            >
              <ImageIcon size={20} className="text-neutral-500" />
              <span className="text-sm font-semibold text-neutral-700">갤러리에서 선택</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
