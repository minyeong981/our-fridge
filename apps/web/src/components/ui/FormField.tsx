'use client'

import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  optional?: boolean
  maxLength: number
  value: string
  onChange: (value: string) => void
  placeholder?: string
  as?: 'input' | 'textarea'
  rows?: number
  variant?: 'white' | 'muted'
}

export function FormField({
  label,
  optional,
  maxLength,
  value,
  onChange,
  placeholder,
  as = 'input',
  rows = 3,
  variant = 'white',
}: FormFieldProps) {
  const bg = variant === 'muted' ? 'bg-neutral-50' : 'bg-white'

  const inputClass = cn(
    'w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition',
    bg,
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value.slice(0, maxLength))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-700">
          {label}
          {optional && <span className="text-neutral-400 font-normal ml-1">(선택)</span>}
        </label>
        <span
          className="text-xs text-neutral-400"
        >
          {value.length}/{maxLength}
        </span>
      </div>
      {as === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rows={rows}
          className={cn(inputClass, 'resize-none')}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={inputClass}
        />
      )}
    </div>
  )
}
