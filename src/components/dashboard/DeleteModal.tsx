'use client'

import { useEffect } from 'react'
import Spinner from '@/components/ui/Spinner'

interface DeleteModalProps {
  onConfirm: () => Promise<void>
  onClose: () => void
  isLoading: boolean
}

export default function DeleteModal({ onConfirm, onClose, isLoading }: DeleteModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
        style={{ border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: '#fee2e2' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Excluir registro
            </h3>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Tem certeza? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-primary flex-1"
            style={{ backgroundColor: '#b91c1c' }}
          >
            {isLoading ? (
              <>
                <Spinner />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
