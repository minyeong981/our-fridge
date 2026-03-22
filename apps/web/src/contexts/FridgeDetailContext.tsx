'use client'

import { createContext, useContext, useState } from 'react'

interface FridgeDetailContextValue {
  fridgeName: string
  fridgeLocation: string
  isSidePanelOpen: boolean
  setFridgeName: (name: string) => void
  setFridgeLocation: (location: string) => void
  setIsSidePanelOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const FridgeDetailContext = createContext<FridgeDetailContextValue | null>(null)

export function FridgeDetailProvider({ children }: { children: React.ReactNode }) {
  const [fridgeName, setFridgeName] = useState('')
  const [fridgeLocation, setFridgeLocation] = useState('')
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  return (
    <FridgeDetailContext.Provider
      value={{ fridgeName, fridgeLocation, isSidePanelOpen, setFridgeName, setFridgeLocation, setIsSidePanelOpen }}
    >
      {children}
    </FridgeDetailContext.Provider>
  )
}

export function useFridgeDetail() {
  const ctx = useContext(FridgeDetailContext)
  if (!ctx) throw new Error('useFridgeDetail must be used within FridgeDetailProvider')
  return ctx
}
