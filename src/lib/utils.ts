/** Formata um número como moeda brasileira (R$) */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma string de data "YYYY-MM-DD" no padrão brasileiro DD/MM/YYYY.
 * Sempre adiciona T00:00:00 para evitar shift de fuso UTC→GMT-3.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

/** Retorna o valor de hoje no formato "YYYY-MM-DD" (fuso local) */
export function todayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Retorna "YYYY-MM" do mês atual */
export function currentMonthValue(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Retorna o primeiro e último dia do mês atual no formato "YYYY-MM-DD" */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

/**
 * Retorna quantos dias um pagamento pendente está atrasado.
 * Retorna 0 se não está atrasado ou se já foi recebido.
 */
export function daysOverdue(dataPrevista: string, status: string): number {
  if (status !== 'Pendente') return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dataPrevista + 'T00:00:00')
  if (due >= today) return 0
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

/** Nome do mês por extenso em português */
export function monthName(yearMonth: string): string {
  if (!yearMonth) return ''
  const [year, month] = yearMonth.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
}
