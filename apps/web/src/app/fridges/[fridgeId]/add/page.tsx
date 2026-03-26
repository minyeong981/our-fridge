'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { Camera } from 'lucide-react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { FormField } from '@/components/ui/FormField'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { CalendarPicker } from '@/components/ui/CalendarPicker'
import { getItem, createItem, updateItem, uploadItemImage } from '@our-fridge/api'
import type { StorageType } from '@our-fridge/shared'

const MAX_NAME_LENGTH = 10
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

  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [storage, setStorage] = useState<StorageType>('냉장')
  const [memo, setMemo] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const webpPreviewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL('@/workers/imageProcessor.ts', import.meta.url))
    return () => {
      workerRef.current?.terminate()
      if (webpPreviewUrlRef.current) URL.revokeObjectURL(webpPreviewUrlRef.current)
    }
  }, [])

  useEffect(() => {
    if (prefill) {
      setName(prefill.name)
      setExpiresAt(prefill.expireDate ?? '')
      setStorage(prefill.storageType)
      setMemo(prefill.memo ?? '')
      if (prefill.imageUrl) {
        setImageUrl(prefill.imageUrl)
        setImagePreview(prefill.imageUrl)
      }
    }
  }, [prefill])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const worker = workerRef.current
    if (!file || !worker) return

    // 이전 WebP blob URL 해제
    if (webpPreviewUrlRef.current) {
      URL.revokeObjectURL(webpPreviewUrlRef.current)
      webpPreviewUrlRef.current = null
    }

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setIsUploadingImage(true)

    let bitmap: ImageBitmap | null = null
    try {
      bitmap = await createImageBitmap(file)

      const result = await new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (ev) => resolve(ev.data.arrayBuffer)
        worker.onerror = reject
        worker.postMessage({ bitmap }, [bitmap as ImageBitmap])
        bitmap = null  // worker로 ownership 이전 — 이후 close는 worker 담당
      })

      URL.revokeObjectURL(previewUrl)
      const blob = new Blob([result], { type: 'image/webp' })
      const webpUrl = URL.createObjectURL(blob)
      webpPreviewUrlRef.current = webpUrl
      setImagePreview(webpUrl)

      const base64 = await blobToBase64(blob)
      const url = await uploadItemImage(fridgeId, base64, 'webp')
      setImageUrl(url)
    } catch {
      bitmap?.close()           // postMessage 전에 실패한 경우만 도달
      URL.revokeObjectURL(previewUrl)
      setImagePreview(null)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      if (isEditMode && itemId) {
        return updateItem(itemId, {
          name: name.trim(),
          storageType: storage,
          expireDate: expiresAt || null,
          memo: memo.trim() || null,
          imageUrl: imageUrl ?? undefined,
        })
      }
      return createItem({
        fridgeId,
        name: name.trim(),
        storageType: storage,
        expireDate: expiresAt || null,
        memo: memo.trim() || null,
        imageUrl: imageUrl ?? undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', fridgeId] })
      router.back()
    },
  })

  const canSubmit = name.trim() && (isEditMode || !!imageUrl) && !isPending && !isUploadingImage

  const handleSubmit = () => {
    if (!canSubmit) return
    save()
  }

  return (
    <div className="h-full bg-neutral-50 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
          {/* 사진 등록 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-700">
              사진
              {!isEditMode && <span className="ml-1 text-xs font-normal text-red-400">*</span>}
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'w-32 h-32 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1.5 transition-colors',
                imagePreview
                  ? 'border-0'
                  : 'bg-white border border-dashed border-neutral-300 hover:bg-neutral-50',
              )}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={22} className={cn('text-neutral-400', isUploadingImage && 'animate-pulse')} />
                  <span className="text-xs text-neutral-400 font-medium">
                    {isUploadingImage ? '업로드 중...' : '사진 추가'}
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

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
            <CalendarPicker value={expiresAt} onChange={setExpiresAt} />
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
