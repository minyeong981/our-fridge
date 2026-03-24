import { Search } from 'lucide-react'

interface SpaceSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SpaceSearchBar({ value, onChange }: SpaceSearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        type="text"
        placeholder="공간 검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
      />
    </div>
  )
}
