'use client'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <>
      <button className="fixed inset-0 bg-black/30 z-[90]" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-[100] px-6">
        <div className="bg-white rounded-2xl w-full max-w-sm p-6">
          <p className="text-base font-bold text-neutral-900 mb-2">{title}</p>
          <p className="text-sm text-neutral-500 leading-relaxed mb-6">{description}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-neutral-100 text-sm font-bold text-neutral-600"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 rounded-xl text-sm font-bold text-white ${
                destructive ? 'bg-red-500' : 'bg-primary'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
