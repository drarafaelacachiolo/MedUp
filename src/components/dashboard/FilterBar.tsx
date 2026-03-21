import type { StatusAtendimento } from '@/types/database'

type FilterStatus = 'Todos' | StatusAtendimento

interface FilterBarProps {
  status: FilterStatus
  month: string        // "YYYY-MM" ou "" para todos
  onStatusChange: (s: FilterStatus) => void
  onMonthChange: (m: string) => void
}

const STATUS_OPTIONS: { key: FilterStatus; label: string }[] = [
  { key: 'Todos',    label: 'Todos' },
  { key: 'Pendente', label: 'Pendente' },
  { key: 'Recebido', label: 'Recebido' },
]

export default function FilterBar({
  status,
  month,
  onStatusChange,
  onMonthChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Filtro de status */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--border-mid)' }}
      >
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => onStatusChange(opt.key)}
              className="px-3 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--teal)' : 'transparent',
                color: isActive ? '#fff' : 'var(--ink-mid)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Filtro de mês */}
      <div className="flex items-center gap-2">
        <input
          type="month"
          className="field py-2 text-sm w-auto"
          style={{ minHeight: '40px' }}
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        />
        {month && (
          <button
            onClick={() => onMonthChange('')}
            className="text-xs px-2 py-1.5 rounded transition-colors"
            style={{ color: 'var(--ink-light)' }}
            title="Ver todos os meses"
          >
            Todos os meses
          </button>
        )}
      </div>
    </div>
  )
}
