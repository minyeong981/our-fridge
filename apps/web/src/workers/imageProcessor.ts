const MAX_SIZE = 1024
const QUALITY = 0.85

self.onmessage = async (e: MessageEvent<{ bitmap: ImageBitmap }>) => {
  const { bitmap } = e.data

  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = new OffscreenCanvas(width, height)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: QUALITY })
  const arrayBuffer = await blob.arrayBuffer()

  ;(self as unknown as DedicatedWorkerGlobalScope).postMessage({ arrayBuffer }, [arrayBuffer])
}
