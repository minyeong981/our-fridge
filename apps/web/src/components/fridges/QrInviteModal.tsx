'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download } from 'lucide-react'

interface QrInviteModalProps {
  fridgeName: string
  inviteUrl: string
  onClose: () => void
}

export function QrInviteModal({ fridgeName, inviteUrl, onClose }: QrInviteModalProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const handleDownloadPdf = async () => {
    // SVG → Canvas → PDF (jsPDF 없이 SVG 직접 다운로드)
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size + 80 // 텍스트 공간

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 배경 흰색
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // SVG → Image
    const img = new Image()
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 40, 20, size - 80, size - 80)
      URL.revokeObjectURL(url)

      // 냉장고 이름 텍스트
      ctx.fillStyle = '#1a1a1a'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(fridgeName, size / 2, size - 30)

      ctx.fillStyle = '#999'
      ctx.font = '12px sans-serif'
      ctx.fillText('우리의 냉장고', size / 2, size - 10)

      // PNG 다운로드 (PDF 대신 고해상도 PNG)
      const link = document.createElement('a')
      link.download = `${fridgeName}_초대QR.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = url
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[90]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[90] px-6 pointer-events-none">
        <div className="bg-white rounded-3xl w-full max-w-xs pointer-events-auto shadow-xl overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <p className="text-xs text-neutral-400">초대 QR코드</p>
              <p className="text-sm font-bold text-neutral-800 mt-0.5">{fridgeName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
            >
              <X size={15} className="text-neutral-500" />
            </button>
          </div>

          {/* QR 코드 */}
          <div ref={qrRef} className="flex items-center justify-center px-8 py-4">
            <div className="p-4 rounded-2xl border-2 border-neutral-100">
              <QRCodeSVG
                value={inviteUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
                level="M"
              />
            </div>
          </div>

          {/* 다운로드 버튼 */}
          <div className="px-5 pb-6">
            <button
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white text-sm font-bold"
            >
              <Download size={15} />
              이미지로 저장
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
