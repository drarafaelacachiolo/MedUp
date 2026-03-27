import type { TipoAtendimento } from '@/types/database'

export type FilterStatus = 'Todos' | 'Pendente' | 'Atrasado' | 'Recebido'
export type FilterTipo = 'Todos' | TipoAtendimento

interface FilterBarProps {
  tipo: FilterTipo
  status: FilterStatus
  month: string
  search: string
  banco: string
  tipoOptions: string[]
  statusOptions: string[]
  monthOptions: string[]
  bancoOptions: string[]
  onTipoChange: (t: FilterTipo) => void
  onStatusChange: (s: FilterStatus) => void
  onMonthChange: (m: string) => void
  onSearchChange: (s: string) => void
  onBancoChange: (b: string) => void
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const SELECT_STYLE = {
  minHeight: '40px',
  fontFamily: 'Inter, sans-serif',
  paddingRight: '32px',
  fontSize: '14px',
}

export default function FilterBar({
  tipo, status, month, search, banco,
  tipoOptions, statusOptions, monthOptions, bancoOptions,
  onTipoChange, onStatusChange, onMonthChange, onSearchChange, onBancoChange,
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

      {/* Filtros em dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {tipoOptions.length > 0 && (
          <select
            className="field py-2 text-sm w-auto"
            style={SELECT_STYLE}
            value={tipo}
            onChange={(e) => onTipoChange(e.target.value as FilterTipo)}
          >
            <option value="Todos">Todos os tipos</option>
            {tipoOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        {statusOptions.length > 0 && (
          <select
            className="field py-2 text-sm w-auto"
            style={SELECT_STYLE}
            value={status}
            onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
          >
            <option value="Todos">Todos os status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {bancoOptions.length > 0 && (
          <select
            className="field py-2 text-sm w-auto"
            style={SELECT_STYLE}
            value={banco}
            onChange={(e) => onBancoChange(e.target.value)}
          >
            <option value="">Todos os bancos</option>
            {bancoOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}

        <select
          className="field py-2 text-sm w-auto"
          style={SELECT_STYLE}
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        >
          <option value="">Todos os meses</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
