import { formatCurrency } from '@/lib/utils'

interface SummaryCardsProps {
  totalPendente: number
  totalRecebidoMes: number
  qtdPendente: number
  mesNome: string
}

export default function SummaryCards({
  totalPendente,
  totalRecebidoMes,
  qtdPendente,
  mesNome,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {/* Total a receber */}
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--ink-light)' }}>
            A Receber
          </p>
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: '#FEE9CC', color: '#8A500A' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </span>
        </div>
        <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--amber)', fontFamily: 'var(--font-sans)' }}>
          {formatCurrency(totalPendente)}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>
          {qtdPendente} pendente{qtdPendente !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Recebido no mês */}
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--ink-light)' }}>
            Recebido em {mesNome}
          </p>
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: '#E0EDE2', color: '#3D5E3F' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </div>
        <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--forest)', fontFamily: 'var(--font-sans)' }}>
          {formatCurrency(totalRecebidoMes)}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>
          Confirmado este mês
        </p>
      </div>

      {/* Pendentes */}
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--ink-light)' }}>
            Pendentes
          </p>
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: '#F3ECF0', color: '#5B2D45' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </span>
        </div>
        <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--wine)', fontFamily: 'var(--font-sans)' }}>
          {qtdPendente}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>
          Aguardando recebimento
        </p>
      </div>
    </div>
  )
}
