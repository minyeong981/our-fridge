'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { MultiImagePicker } from '@/components/ui/MultiImagePicker'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { FormField } from '@/components/ui/FormField'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { CalendarPicker } from '@/components/ui/CalendarPicker'
import { getItem, createItem, updateItem, uploadItemImage } from '@our-fridge/api'
import type { StorageType } from '@our-fridge/shared'

const MAX_NAME_LENGTH = 20
const MAX_MEMO_LENGTH = 100

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function submitLabel(isPending: boolean, isUploadingImage: boolean, isEditMode: boolean) {
  if (isPending) return '저장 중...'
  if (isUploadingImage) return '사진 업로드 중...'
  return isEditMode ? '수정하기' : '냉장고에 넣기'
}

function AddItemContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { fridgeId } = useParams<{ fridgeId: string }>()
  const searchParams = useSearchParams()
  const itemId = searchParams.get('itemId')
  const isEditMode = !!itemId

  const { data: prefill } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId ?? ''),
    enabled: !!itemId,
  })

  const MAX_PHOTOS = 3

  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [storage, setStorage] = useState<StorageType>('냉장')
  const [memo, setMemo] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const blobPreviewUrlsRef = useRef<string[]>([])

  useEffect(() => {
    workerRef.current = new Worker(new URL('@/workers/imageProcessor.ts', import.meta.url))
    return () => {
      workerRef.current?.terminate()
      blobPreviewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  useEffect(() => {
    if (prefill) {
      setName(prefill.name)
      setExpiresAt(prefill.expireDate ?? '')
      setStorage(prefill.storageType)
      setMemo(prefill.memo ?? '')
      setImagePreviews(prefill.imageUrls)
      setImageUrls(prefill.imageUrls)
    }
  }, [prefill])

  const processImageBlob = useCallback(async (
    blob: Blob,
    immediatePreview?: string,
  ): Promise<{ webpPreviewUrl: string; uploadedUrl: string } | null> => {
    const worker = workerRef.current
    if (!worker) return null
    setIsUploadingImage(true)
    let bitmap: ImageBitmap | null = null
    try {
      bitmap = await createImageBitmap(blob)
      const result = await new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (ev) => resolve(ev.data.arrayBuffer)
        worker.onerror = reject
        worker.postMessage({ bitmap }, [bitmap as ImageBitmap])
        bitmap = null
      })
      if (immediatePreview) URL.revokeObjectURL(immediatePreview)
      const webpBlob = new Blob([result], { type: 'image/webp' })
      const webpPreviewUrl = URL.createObjectURL(webpBlob)
      blobPreviewUrlsRef.current.push(webpPreviewUrl)
      const base64 = await blobToBase64(webpBlob)
      const uploadedUrl = await uploadItemImage(fridgeId, base64, 'webp')
      return { webpPreviewUrl, uploadedUrl }
    } catch {
      bitmap?.close()
      if (immediatePreview) URL.revokeObjectURL(immediatePreview)
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }, [fridgeId])

  const addImage = useCallback(async (blob: Blob, immediatePreview?: string) => {
    setImagePreviews((prev) => {
      if (prev.length >= MAX_PHOTOS) return prev
      return [...prev, immediatePreview ?? '']
    })
    const idx = imagePreviews.length
    const result = await processImageBlob(blob, immediatePreview)
    if (result) {
      setImagePreviews((prev) => { const next = [...prev]; next[idx] = result.webpPreviewUrl; return next })
      setImageUrls((prev) => [...prev, result.uploadedUrl])
    } else {
      setImagePreviews((prev) => prev.filter((_, i) => i !== idx))
    }
  }, [imagePreviews.length, processImageBlob])

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFileChange = async (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    await addImage(file, previewUrl)
  }

  useEffect(() => {
    const handleRNMessage = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'image_picked' && msg.base64) {
          const bytes = Uint8Array.from(atob(msg.base64), (c) => c.charCodeAt(0))
          const blob = new Blob([bytes], { type: 'image/jpeg' })
          addImage(blob, `data:image/jpeg;base64,${msg.base64}`)
        }
      } catch {}
    }
    window.addEventListener('message', handleRNMessage)
    return () => window.removeEventListener('message', handleRNMessage)
  }, [addImage])

  const handleRNPick = (source: 'camera' | 'gallery') => {
    ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'pick_image', data: { source } }))
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      if (isEditMode && itemId) {
        return updateItem(itemId, {
          name: name.trim(),
          storageType: storage,
          expireDate: expiresAt || null,
          memo: memo.trim() || null,
          imageUrls,
        })
      }
      return createItem({
        fridgeId,
        name: name.trim(),
        storageType: storage,
        expireDate: expiresAt || null,
        memo: memo.trim() || null,
        imageUrls,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', fridgeId] })
      if (isEditMode && itemId) {
        queryClient.invalidateQueries({ queryKey: ['item', itemId] })
      }
      router.back()
    },
  })

  const allUploaded = imagePreviews.length === imageUrls.length
  const canSubmit = name.trim() && (isEditMode || imageUrls.length > 0) && allUploaded && !isPending && !isUploadingImage

  const handleSubmit = () => {
    if (!canSubmit) return
    save()
  }

  return (
    <div className="h-full bg-neutral-50 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
          {/* 사진 등록 */}
          <MultiImagePicker
            label="사진"
            required={!isEditMode}
            photos={imagePreviews}
            max={MAX_PHOTOS}
            isUploading={isUploadingImage}
            onRemove={removeImage}
            onFileChange={handleFileChange}
            onRNPick={handleRNPick}
          />

          <FormField
            label="이름"
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={setName}
            placeholder="예: 엄마표 김치"
          />

          {/* 소비기한 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-700">
              소비기한 / 유통기한{' '}
              <span className="text-xs font-normal text-neutral-400">(선택)</span>
            </label>
            <CalendarPicker value={expiresAt} onChange={setExpiresAt} minDate={new Date()} />
          </div>

          {/* 보관 방식 */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-neutral-700">보관 방식</p>
            <div className="flex gap-2">
              {(['냉장', '냉동'] as StorageType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStorage(s)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                    storage === s
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-500 border border-neutral-200',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <FormField
            label="메모"
            optional
            maxLength={MAX_MEMO_LENGTH}
            value={memo}
            onChange={setMemo}
            placeholder="기억해야 할 내용이 있나요? (예: 이번 주 안에 먹기)"
            as="textarea"
            rows={3}
          />

          <div className="pb-24 pt-1">
            <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
              {submitLabel(isPending, isUploadingImage, isEditMode)}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AddItemPage() {
  return (
    <Suspense>
      <AddItemContent />
    </Suspense>
  )
}
