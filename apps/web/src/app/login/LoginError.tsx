'use client'

import { useEffect } from 'react'

export function LoginError({ error }: { error: string }) {
  useEffect(() => {
    if ((window as any).ReactNativeWebView) {
      ;(window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'auth_failed', error }),
      )
    }
  }, [error])

  return null
}
