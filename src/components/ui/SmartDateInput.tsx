'use client'

import { useState, useRef, useEffect } from 'react'

interface SmartDateInputProps {
  value: string        // YYYY-MM-DD or ''
  onChange: (v: string) => void
  required?: boolean
  className?: string
}

function parseDate(v: string) {
  if (!v || v.length < 10) return { d: '', m: '', y: '' }
  return { d: v.slice(8, 10), m: v.slice(5, 7), y: v.slice(0, 4) }
}

export default function SmartDateInput({ value, onChange, required, className }: SmartDateInputProps) {
  const [parts, setParts] = useState(() => parseDate(value))
  const dayRef   = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef  = useRef<HTMLInputElement>(null)
  const lastEmitted = useRef(value)

  // Sync local state when parent changes value externally (e.g., form reset)
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value
      setParts(parseDate(value))
    }
  }, [value])

  function tryEmit(d: string, m: string, y: string) {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const v = `${y}-${m}-${d}`
      lastEmitted.current = v
      onChange(v)
    }
  }

  function handleDay(raw: string) {
    const v = raw.replace(/\D/g, '').slice(0, 2)
    setParts(p => ({ ...p, d: v }))
    if (v.length === 2) { monthRef.current?.focus(); monthRef.current?.select() }
    tryEmit(v, parts.m, parts.y)
  }

  function handleMonth(raw: string) {
    const v = raw.replace(/\D/g, '').slice(0, 2)
    setParts(p => ({ ...p, m: v }))
    if (v.length === 2) { yearRef.current?.focus(); yearRef.current?.select() }
    tryEmit(parts.d, v, parts.y)
  }

  function handleYear(raw: string) {
    const v = raw.replace(/\D/g, '').slice(0, 4)
    setParts(p => ({ ...p, y: v }))
    tryEmit(parts.d, parts.m, v)
  }

  function handleMonthKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !parts.m) {
      e.preventDefault()
      dayRef.current?.focus()
      dayRef.current?.select()
    }
  }

  function handleYearKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !parts.y) {
      e.preventDefault()
      monthRef.current?.focus()
      monthRef.current?.select()
    }
  }

  const sub: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    textAlign: 'center',
    fontSize: 'inherit',
    color: 'inherit',
    padding: 0,
    fontFamily: 'inherit',
  }

  return (
    <div
      className={`field flex items-center ${className ?? ''}`}
      style={{ gap: '2px', cursor: 'text' }}
      onClick={() => {
        const active = document.activeElement
        if (active !== dayRef.current && active !== monthRef.current && active !== yearRef.current) {
          dayRef.current?.focus()
        }
      }}
    >
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        placeholder="DD"
        value={parts.d}
        onChange={e => handleDay(e.target.value)}
        style={{ ...sub, width: '26px' }}
      />
      <span style={{ color: '#C0B8B0', userSelect: 'none' }}>/</span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        value={parts.m}
        onChange={e => handleMonth(e.target.value)}
        onKeyDown={handleMonthKeyDown}
        style={{ ...sub, width: '26px' }}
      />
      <span style={{ color: '#C0B8B0', userSelect: 'none' }}>/</span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        placeholder="AAAA"
        value={parts.y}
        onChange={e => handleYear(e.target.value)}
        onKeyDown={handleYearKeyDown}
        style={{ ...sub, width: '44px' }}
      />
      {/* Hidden input for native required validation */}
      {required && (
        <input
          type="text"
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        />
      )}
    </div>
  )
}
