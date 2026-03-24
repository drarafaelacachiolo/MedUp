import { formatCurrency } from '@/lib/utils'

interface SummaryCardsProps {
  totalPendente: number
  totalRecebidoMes: number
  qtdAtrasados: number
  mesNome: string
}

export default function SummaryCards({
  totalPendente,
  totalRecebidoMes,
  qtdAtrasados,
  mesNome,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {/* A Receber */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
          A Receber
        </p>
        <p
          className="text-2xl font-bold tabular-nums"
          style={{
            background: 'linear-gradient(135deg, #C4752A, #F0A030)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {formatCurrency(totalPendente)}
        </p>
      </div>

      {/* Recebido no mês */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Recebido em {mesNome}
        </p>
        <p
          className="text-2xl font-bold tabular-nums"
          style={{
            background: 'linear-gradient(135deg, #3D5E3F, #5A9B5D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {formatCurrency(totalRecebidoMes)}
        </p>
      </div>

      {/* Atrasados */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Atrasados
        </p>
        <p className="text-2xl font-bold tabular-nums" style={{ color: '#9B1D3E' }}>
          {qtdAtrasados}
        </p>
      </div>
    </div>
  )
}
