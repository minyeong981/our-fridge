'use client'

import { useFridgeDetailStore } from '@/stores/useFridgeDetailStore'

export function FridgeDetailProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function useFridgeDetail() {
  return useFridgeDetailStore()
}
