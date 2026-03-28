'use client'

import { useState, useRef, useEffect } from 'react'

interface AutocompleteInputProps {
  value: string
  onChange: (val: string) => void
  suggestions: string[]
  placeholder?: string
  required?: boolean
  className?: string
}

export default function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  required,
  className = 'field',
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = value.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()).slice(0, 8)
    : suggestions.slice(0, 8)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        required={required}
        className={className}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl border shadow-lg overflow-hidden"
          style={{ backgroundColor: '#fff', borderColor: '#E5E1DB' }}
        >
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{ color: '#1A1816' }}
              onMouseDown={(e) => { e.preventDefault(); onChange(s); setOpen(false) }}
              onTouchEnd={(e) => { e.preventDefault(); onChange(s); setOpen(false) }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9F8F6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
