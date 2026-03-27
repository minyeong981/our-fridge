import { create } from 'zustand'

interface FridgeDetailState {
  fridgeName: string
  fridgeLocation: string
  isSidePanelOpen: boolean
  setFridgeName: (name: string) => void
  setFridgeLocation: (location: string) => void
  setIsSidePanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

export const useFridgeDetailStore = create<FridgeDetailState>((set) => ({
  fridgeName: '',
  fridgeLocation: '',
  isSidePanelOpen: false,
  setFridgeName: (fridgeName) => set({ fridgeName }),
  setFridgeLocation: (fridgeLocation) => set({ fridgeLocation }),
  setIsSidePanelOpen: (open) =>
    set((state) => ({
      isSidePanelOpen: typeof open === 'function' ? open(state.isSidePanelOpen) : open,
    })),
}))
