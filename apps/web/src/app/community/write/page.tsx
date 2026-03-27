'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, ImageIcon, X, ChevronLeft } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { createPost, updatePost, getPost, uploadPostImage } from '@our-fridge/api'
import type { PostCategory } from '@our-fridge/shared'

function isInRN(): boolean {
  return typeof window !== 'undefined' && !!(window as any).ReactNativeWebView
}

function postToRN(data: object) {
  ;(window as any).ReactNativeWebView.postMessage(JSON.stringify(data))
}

const CATEGORIES: PostCategory[] = ['정보', '나눔/공유', '잡담', '이의 제기/신고']

const MAX_TITLE_LENGTH = 50
const MAX_CONTENT_LENGTH = 500
const MAX_PHOTOS = 3
const CONTENT_ROWS = 8

function CommunityWriteContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')
  const fridgeId = searchParams.get('fridgeId')
  const isEditMode = !!postId

  const { data: prefill } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId!),
    enabled: !!postId,
  })

  const [category, setCategory] = useState<PostCategory>('나눔/공유')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [photos, setPhotos] = useState<string[]>([]) // 미리보기용 data URL
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]) // 업로드된 URL
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [showPickerSheet, setShowPickerSheet] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (prefill) {
      setCategory(prefill.category)
      setTitle(prefill.title)
      setContent(prefill.content)
      setIsAnonymous(prefill.isAnonymous)
      setPhotos(prefill.imageUrls)
      setUploadedUrls(prefill.imageUrls)
    }
  }, [prefill])

  // RN 이미지 수신
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      try {
        const msg = JSON.parse(typeof e.data === 'string' ? e.data : JSON.stringify(e.data))
        if (msg.type === 'image_picked' && msg.base64) {
          handleUploadBase64(`data:image/jpeg;base64,${msg.base64}`, msg.base64)
        }
      } catch {}
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [photos])

  const handleUploadBase64 = async (dataUrl: string, base64: string) => {
    if (photos.length >= MAX_PHOTOS) return
    setPhotos((prev) => [...prev, dataUrl])
    setIsUploadingPhoto(true)
    try {
      const url = await uploadPostImage(base64, 'jpeg')
      setUploadedUrls((prev) => [...prev, url])
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const openPicker = () => {
    if (photos.length >= MAX_PHOTOS) return
    if (isInRN()) {
      setShowPickerSheet(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = (ev) => resolve(ev.target?.result as string)
      reader.readAsDataURL(file)
    })
    const base64 = dataUrl.split(',')[1]
    await handleUploadBase64(dataUrl, base64)
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const { mutate: submit, isPending } = useMutation<void>({
    mutationFn: async () => {
      if (isEditMode && postId) {
        await updatePost(postId, {
          category,
          title: title.trim(),
          content: content.trim(),
          isAnonymous,
          imageUrls: uploadedUrls,
        })
      } else {
        await createPost({
          fridgeId: fridgeId!,
          category,
          title: title.trim(),
          content: content.trim(),
          isAnonymous,
          imageUrls: uploadedUrls,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['post', postId] })
        router.back()
      } else {
        router.replace('/community')
      }
    },
  })

  const isReport = category === '이의 제기/신고'
  const canSubmit =
    title.trim().length > 0 && content.trim().length > 0 && !isPending && !isUploadingPhoto

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>
        <h1 className="font-bold text-base text-neutral-800">
          {isEditMode ? '게시글 수정' : '글 작성'}
        </h1>
        <button
          disabled={!canSubmit}
          onClick={() => {
            if (canSubmit) submit()
          }}
          className="text-sm font-bold text-primary disabled:text-neutral-300 transition-colors"
        >
          {isPending ? '저장 중...' : '완료'}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 pt-5 pb-8 flex flex-col gap-5">
          {/* 카테고리 */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border',
                  category === c
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-neutral-500 border-neutral-200',
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* 제목 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
            placeholder="제목을 입력해 주세요"
            className="w-full text-neutral-800 font-bold text-lg placeholder:text-neutral-300 border-b border-neutral-100 pb-4 outline-none bg-transparent"
          />

          {/* 내용 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
            placeholder="내용을 입력해 주세요"
            rows={CONTENT_ROWS}
            className="w-full text-sm text-neutral-700 placeholder:text-neutral-300 outline-none resize-none bg-transparent leading-relaxed"
          />

          {/* 사진 추가 */}
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold text-neutral-500">
              사진{' '}
              <span className="text-neutral-400 font-normal">
                {photos.length} / {MAX_PHOTOS}
              </span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {/* 추가 버튼 — 항상 맨 앞 */}
              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={openPicker}
                  disabled={isUploadingPhoto}
                  className="w-24 h-24 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center gap-1.5 text-neutral-400 shrink-0 disabled:opacity-50"
                >
                  <Camera size={18} className={isUploadingPhoto ? 'animate-pulse' : ''} />
                  <span className="text-[10px] font-semibold tracking-wide">
                    {isUploadingPhoto ? '업로드 중...' : '사진 추가'}
                  </span>
                </button>
              )}
              {photos.map((src, i) => (
                <div key={i} className="relative w-24 h-24 shrink-0">
                  <img src={src} alt="" className="w-full h-full rounded-2xl object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-800 rounded-full flex items-center justify-center"
                  >
                    <X size={11} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 익명 — 이의 제기/신고 전용 */}
          {isReport && (
            <button
              onClick={() => setIsAnonymous((v) => !v)}
              className="flex items-center gap-2 self-start"
            >
              <div
                className={cn(
                  'w-4 h-4 rounded flex items-center justify-center border transition-colors',
                  isAnonymous ? 'bg-primary border-primary' : 'border-neutral-300',
                )}
              >
                {isAnonymous && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l2.5 2.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs font-semibold text-neutral-500">익명으로 작성</span>
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* RN 이미지 소스 선택 시트 */}
      {showPickerSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowPickerSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 pb-8">
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-10 h-1 bg-neutral-200 rounded-full" />
            </div>
            <button
              onClick={() => {
                setShowPickerSheet(false)
                postToRN({ type: 'pick_image', source: 'camera' })
              }}
              className="w-full flex items-center gap-4 px-6 py-4 active:bg-neutral-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Camera size={18} className="text-neutral-600" />
              </div>
              <span className="text-sm font-semibold text-neutral-800">카메라로 찍기</span>
            </button>
            <button
              onClick={() => {
                setShowPickerSheet(false)
                postToRN({ type: 'pick_image', source: 'gallery' })
              }}
              className="w-full flex items-center gap-4 px-6 py-4 active:bg-neutral-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <ImageIcon size={18} className="text-neutral-600" />
              </div>
              <span className="text-sm font-semibold text-neutral-800">갤러리에서 선택</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function CommunityWritePage() {
  return (
    <Suspense>
      <CommunityWriteContent />
    </Suspense>
  )
}
