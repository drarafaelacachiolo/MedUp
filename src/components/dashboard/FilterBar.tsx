import type { StatusAtendimento } from '@/types/database'

type FilterStatus = 'Todos' | StatusAtendimento

interface FilterBarProps {
  status: FilterStatus
  month: string
  search: string
  banco: string
  bancoOptions: string[]
  onStatusChange: (s: FilterStatus) => void
  onMonthChange: (m: string) => void
  onSearchChange: (s: string) => void
  onBancoChange: (b: string) => void
}

const STATUS_OPTIONS: { key: FilterStatus; label: string }[] = [
  { key: 'Todos',    label: 'Todos' },
  { key: 'Pendente', label: 'Pendente' },
  { key: 'Recebido', label: 'Recebido' },
]

export default function FilterBar({
  status,
  month,
  search,
  banco,
  bancoOptions,
  onStatusChange,
  onMonthChange,
  onSearchChange,
  onBancoChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Busca */}
      <div className="relative">
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A8A09A', pointerEvents: 'none' }}
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar por paciente, local, valor, data, banco..."
          className="field"
          style={{ paddingLeft: '38px', paddingRight: search ? '36px' : '14px', minHeight: '40px', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#A8A09A', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filtros de status, mês e banco */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))' }}
        >
          {STATUS_OPTIONS.map((opt) => {
            const isActive = status === opt.key
            return (
              <button
                key={opt.key}
                onClick={() => onStatusChange(opt.key)}
                className="px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: isActive ? '#1C4E80' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#7A756E',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <input
          type="month"
          className="field py-2 text-sm w-auto"
          style={{ minHeight: '40px', fontFamily: 'Inter, sans-serif' }}
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        />

        {bancoOptions.length > 0 && (
          <select
            className="field py-2 text-sm w-auto"
            style={{ minHeight: '40px', fontFamily: 'Inter, sans-serif', paddingRight: '32px' }}
            value={banco}
            onChange={(e) => onBancoChange(e.target.value)}
          >
            <option value="">Todos os bancos</option>
            {bancoOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
